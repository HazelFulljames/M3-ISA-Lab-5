const Messages = require('../lang/en/user');
const http = require('http');

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * HTTP server built on Node's http module only. Routing is done by hand
 * (no Express, no router library). Works under any URL prefix, e.g.
 * https://yourdomain.xyz/COMP4537/labs/5/api/v1/sql/"select * from patient"
 */
class ApiServer {
  static MAX_BODY_BYTES = 64 * 1024;
  // MySQL errors meaning "your account is not allowed to do that"
  static PERMISSION_ERRNOS = new Set([1044, 1142, 1143, 1227, 1370]);

  constructor({ repository, port, allowedOrigin }) {
    this.repository = repository;
    this.port = port;
    this.allowedOrigin = allowedOrigin;

    this.routes = [
      { method: 'GET', pattern: /\/api\/v1\/sql\/(.+)$/, handler: (ctx) => this.getQuery(ctx) },
      { method: 'POST', pattern: /\/api\/v1\/sql\/?$/, handler: (ctx) => this.postQuery(ctx) },
      { method: 'POST', pattern: /\/api\/v1\/patients\/seed\/?$/, handler: () => this.seedPatients() },
    ];

    this.server = http.createServer((req, res) => this.handle(req, res));
  }

  start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`API listening on port ${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => this.server.close(resolve));
  }

  // Handle the requests, this is an API after all

  async handle(req, res) {
    this.setCorsHeaders(res);

    try {
      // Find all routes whose pattern matches the request path
      // There should be exactly one, but if there are multiple, we pick the one with the right HTTP method
      // If none match, we return a 405 Method Not Allowed
      const { pathname } = new URL(req.url, 'http://localhost');
      const matches = this.routes.filter((r) => r.pattern.test(pathname));
      if (matches.length === 0) throw new ApiError(404, Messages.notFound);

      // Answers browser preflight requests without querying the database.
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // Find the route that matches the request method. If none match, we return a 405 Method Not Allowed
      const route = matches.find((r) => r.method === req.method);
      if (!route) throw new ApiError(405, Messages.methodNotAllowed.replace("%1", req.method));

      // Call the route handler and send returned.body as JSON
      const match = pathname.match(route.pattern);
      const { status, body } = await route.handler({ req, match });
      this.sendJson(res, status, body);
      // The above code calls the route handler and sends the response as JSON.
    } catch (err) {
      const apiError = this.toApiError(err);
      if (apiError.status === 500) console.error(err);
      this.sendJson(res, apiError.status, { error: apiError.message });
    }
  }

  // ---------- route handlers ----------

  /** GET .../api/v1/sql/"select * from patient" */
  async getQuery({ match }) {
    let raw;
    try {
      raw = decodeURIComponent(match[1]);
    } catch {
      throw new ApiError(400, Messages.invalidEncoding);
    }
    const query = this.cleanQuery(raw);
    if (!/^select\b/i.test(query)) {
      throw new ApiError(400, Messages.selectOnly);
    }
    return this.runQuery(query);
  }

  /** POST .../api/v1/sql  with JSON body {"query": "insert into ..."} */
  async postQuery({ req }) {
    const body = await this.readJsonBody(req);
    const query = this.cleanQuery(body.query);
    if (!/^insert\b/i.test(query)) {
      throw new ApiError(400, Messages.insertOnly);
    }
    await this.repository.ensureTable();
    return this.runQuery(query, false);
  }

  /** POST .../api/v1/patients/seed : the Insert button */
  async seedPatients() {
    const count = await this.repository.insertDefaultPatients();
    return { status: 201, body: { message: Messages.inserted.replace("%1", count), affectedRows: count } };
  }

  // ---------- helpers ----------

  async runQuery(query, readOnly = true) {
    const result = await this.repository.runQuery(query, readOnly);
    if (Array.isArray(result)) {
      return { status: 200, body: result }; // SELECT: plain array of rows
    }
    return {
      status: 200,
      body: { message: Messages.queryOk, affectedRows: result.affectedRows, insertId: result.insertId },
    };
  }

  /** Trims, and removes one pair of wrapping quotes (the example URL wraps the query in "..."). */
  cleanQuery(value) {
    if (typeof value !== 'string') throw new ApiError(400, Messages.queryRequired);
    let query = value.trim();
    const quoted = query.match(/^(["'])([\s\S]*)\1$/);
    if (quoted) query = quoted[2].trim();
    if (!query) throw new ApiError(400, Messages.queryEmpty);
    return query;
  }

  readJsonBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > ApiServer.MAX_BODY_BYTES) {
          reject(new ApiError(413, Messages.bodyTooLarge));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
          if (parsed === null || typeof parsed !== 'object') throw new Error();
          resolve(parsed);
        } catch {
          reject(new ApiError(400, Messages.invalidJson));
        }
      });
      req.on('error', reject);
    });
  }

  toApiError(err) {
    if (err instanceof ApiError) return err;
    if (err && ApiServer.PERMISSION_ERRNOS.has(err.errno)) {
      return new ApiError(403, Messages.permissionDenied);
    }
    // MySQL server errors (syntax error, unknown table, ...) have a sqlState; connection problems do not.
    if (err && err.sqlState && err.sqlMessage) {
      return new ApiError(400, err.sqlMessage);
    }
    return new ApiError(500, Messages.internalError);
  }

  setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', this.allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  sendJson(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
  }
}

module.exports = ApiServer;
