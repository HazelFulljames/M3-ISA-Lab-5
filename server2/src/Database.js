const mysql = require('mysql2/promise');

/** Thin wrapper around a MySQL connection pool for one database account. */
class Database {
  constructor({ host, port, user, password, database }) {
    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 5,
      multipleStatements: false, // one statement per request
      dateStrings: true, // return DATETIME as text so old dates don't shift with time zones
    });
  }

  /** Runs a statement. Returns rows (SELECT) or a result header (INSERT etc.). */
  async query(sql, params) {
    const [result] = await this.pool.query(sql, params);
    return result;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = Database;
