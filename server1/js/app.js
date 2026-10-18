import { PatientApi } from "./api.js";
import { Messages } from "../lang/en/user.js";

class PatientApp {
  // Creates the API client and builds the page.
  constructor() {
    this.api = new PatientApi();
    this.root = document.getElementById("app");
    this.build();
  }

  // Adds the buttons, SQL textarea and response area.
  build() {
    document.title = Messages.title;
    this.insertButton = document.createElement("button");
    this.insertButton.type = "button";
    this.insertButton.textContent = Messages.insert;
    this.insertButton.addEventListener("click", () => this.run(() => this.api.insert()));

    const form = document.createElement("form");
    const label = document.createElement("label");
    label.htmlFor = "sql-query";
    label.textContent = Messages.queryLabel;
    this.query = document.createElement("textarea");
    this.query.id = "sql-query";
    this.query.value = Messages.defaultQuery;
    this.submitButton = document.createElement("button");
    this.submitButton.type = "submit";
    this.submitButton.textContent = Messages.submit;
    form.append(label, this.query, this.submitButton);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.submitQuery();
    });

    this.result = document.createElement("pre");
    this.result.setAttribute("role", "status");
    const spacing = document.createElement("p");
    spacing.append(this.insertButton);
    this.root.append(spacing, form, this.result);
  }

  // Rejects empty input and sends the SQL query to the API.
  submitQuery() {
    const query = this.query.value.trim();
    if (!query) {
      this.result.textContent = Messages.emptyQuery;
      return;
    }
    this.run(() => this.api.select(query));
  }

  // Displays the result or error and disables buttons while waiting.
  async run(action) {
    this.insertButton.disabled = true;
    this.submitButton.disabled = true;
    this.result.textContent = Messages.loading;
    try {
      this.result.textContent = await action();
    } catch (error) {
      this.result.textContent = error.message;
    } finally {
      this.insertButton.disabled = false;
      this.submitButton.disabled = false;
    }
  }
}

new PatientApp();

