/**
 * All patient-table logic.
 * - adminDb: can only CREATE, used to make sure the table exists.
 * - restrictedDb: SELECT + INSERT only, used for everything a client sends.
 */
class PatientRepository {
  static CREATE_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS patient (
      patientid   INT(11)      NOT NULL AUTO_INCREMENT,
      name        VARCHAR(100) NOT NULL,
      dateOfBirth DATETIME     NOT NULL,
      PRIMARY KEY (patientid)
    ) ENGINE=InnoDB`;

  static DEFAULT_PATIENTS = [
    ['Sara Brown', '1901-01-01'],
    ['John Smith', '1941-01-01'],
    ['Jack Ma', '1961-01-30'],
    ['Elon Musk', '1999-01-01'],
  ];

  constructor(adminDb, restrictedDb) {
    this.adminDb = adminDb;
    this.restrictedDb = restrictedDb;
  }

  /** Creates the patient table if it does not already exist. */
  async ensureTable() {
    await this.adminDb.query(PatientRepository.CREATE_TABLE_SQL);
  }

  /** Insert-button behaviour: make sure the table exists, then insert the four default patients. */
  async insertDefaultPatients() {
    await this.ensureTable();
    const result = await this.restrictedDb.query(
      'INSERT INTO patient (name, dateOfBirth) VALUES ?',
      [PatientRepository.DEFAULT_PATIENTS]
    );
    return result.affectedRows;
  }

  /** Runs client-supplied SQL as the restricted account. MySQL enforces what is allowed. */
  async runQuery(sql) {
    return this.restrictedDb.query(sql);
  }
}

module.exports = PatientRepository;
