const Config = require('./src/Config');
const Database = require('./src/Database');
const PatientRepository = require('./src/PatientRepository');
const ApiServer = require('./src/ApiServer');

class App {
  constructor(config) {
    this.adminDb = new Database(config.adminDb);
    this.restrictedDb = new Database(config.restrictedDb);
    this.repository = new PatientRepository(this.adminDb, this.restrictedDb);
    this.api = new ApiServer({
      repository: this.repository,
      port: config.port,
      allowedOrigin: config.allowedOrigin,
    });
  }

  async start() {
    await this.repository.ensureTable(); // table is created at startup if missing
    await this.api.start();
  }

  async stop() {
    await this.api.stop();
    await this.adminDb.close();
    await this.restrictedDb.close();
  }
}

async function main() {
  const app = new App(Config.load());
  await app.start();

  const shutdown = () => app.stop().finally(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
