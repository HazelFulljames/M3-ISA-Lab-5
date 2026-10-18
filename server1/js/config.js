export class ApiConfig {
  // API origin; localhost uses the local Node server.
  static baseUrl = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:3000" : "https://m3-isa-lab-5.onrender.com";
  // URL for inserting the four patients.
  static get insertUrl() {
    return this.baseUrl ? `${this.baseUrl.replace(/\/$/, "")}/api/v1/patients/seed` : "";
  }
  // URL template for encoded SQL queries.
  static get selectUrlTemplate() {
    return this.baseUrl ? `${this.baseUrl.replace(/\/$/, "")}/api/v1/sql/{query}` : "";
  }
  // No body is required for the seed request.
  static insertBody = null;
}

