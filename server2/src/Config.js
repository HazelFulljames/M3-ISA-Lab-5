const fs = require('fs');
const path = require('path');

/** Reads settings from environment variables (optionally loaded from a .env file). */
class Config {
  constructor(env) {
    this.port = Number(env.PORT) || 3000;
    this.allowedOrigin = env.ALLOWED_ORIGIN || '*';

    const base = {
      host: env.DB_HOST || 'localhost',
      port: Number(env.DB_PORT) || 3306,
      database: env.DB_NAME || 'lab5',
      ssl: env.DB_SSL_CA_FILE ? {
        ca: fs.readFileSync(path.resolve(__dirname, '..', env.DB_SSL_CA_FILE), 'utf8'),
        rejectUnauthorized: true,
      } : undefined,
    };

    this.adminDb = { ...base, user: env.DB_ADMIN_USER, password: env.DB_ADMIN_PASSWORD };
    this.restrictedDb = { ...base, user: env.DB_RESTRICTED_USER, password: env.DB_RESTRICTED_PASSWORD };
    this.readDb = { ...base, user: env.DB_READ_USER, password: env.DB_READ_PASSWORD };

    this.validate();
  }

  validate() {
    const missing = [];
    if (!this.adminDb.user) missing.push('DB_ADMIN_USER');
    if (!this.restrictedDb.user) missing.push('DB_RESTRICTED_USER');
    if (!this.readDb.user) missing.push('DB_READ_USER');
    if (missing.length) {
      throw new Error(`Missing required setting(s): ${missing.join(', ')}. See .env.example.`);
    }
  }

    /** Loads KEY=value lines from a .env file into process.env (works on any Node version). */
  static loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) {
      console.warn(`No .env file found at ${envPath}; using environment variables only.`);
      return;
    }
    const text = fs.readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
    for (const line of text.split(/\r?\n/)) {
      if (line.trim().startsWith('#')) continue;
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match) continue;
      let value = match[2];
      if (/^(["'])[\s\S]*\1$/.test(value)) value = value.slice(1, -1);
      if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
  }

  static load() {
    Config.loadEnvFile(path.join(__dirname, '..', '.env'));
    return new Config(process.env);
  }
}

module.exports = Config;
