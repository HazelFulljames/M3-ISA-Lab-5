class Messages {
  static notFound = 'Not found';
  static methodNotAllowed = 'Method %1 not allowed here';
  static invalidEncoding = 'Query in the URL is not properly encoded';
  static selectOnly = 'GET only accepts SELECT queries. Use POST for INSERT.';
  static insertOnly = 'POST only accepts INSERT queries. Use GET for SELECT.';
  static inserted = 'Inserted %1 patients';
  static queryOk = 'Query OK';
  static queryRequired = 'A "query" string is required';
  static queryEmpty = 'Query is empty';
  static bodyTooLarge = 'Request body too large';
  static invalidJson = 'Body must be valid JSON like {"query": "..."}';
  static permissionDenied = 'Not allowed: this database account lacks permission for this operation.';
  static internalError = 'Internal server error';
}

module.exports = Messages;
