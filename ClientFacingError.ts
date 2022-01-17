import StatusCode from "status-code-enum";

export default class ClientFacingError extends Error {
  statusCode;
  body;

  constructor(statusCode: StatusCode, body?: any) {
    super();
    this.statusCode = statusCode;
    this.body = body;
  }
}
