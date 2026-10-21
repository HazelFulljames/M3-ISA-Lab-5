import { ApiConfig } from "./config.js";
import { Messages } from "../lang/en/user.js";

export class PatientApi {
  // Sends one POST request per Insert button click.
  insert() {
    const options = { method: "POST" };
    if (ApiConfig.insertBody !== null) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(ApiConfig.insertBody);
    }
  }

  // Sends SQL through GET; database permissions enforce read-only access.
  select(query) {
    const url = ApiConfig.selectUrlTemplate.replace("{query}", () => encodeURIComponent(query));
    return this.request(url, { method: "GET" });
  }

  // Reads JSON or plain-text responses, including server errors.
  async request(url, options) {
    if (!url) throw new Error(Messages.notConnected);
    let response;
    try {
      response = await fetch(url, options);
    } catch {
      throw new Error(Messages.networkError);
    }
    const text = await response.text();
    let displayed = text;
    try {
      displayed = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      // Preserves plain-text responses.
    }
    if (!response.ok) {
      throw new Error(Messages.requestFailed.replace("%1", response.status) + (displayed ? `\n${displayed}` : ""));
    }
    return displayed || Messages.emptyResponse.replace("%1", response.status);
  }
}

