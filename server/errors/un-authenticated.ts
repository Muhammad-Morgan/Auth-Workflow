import { CustomApiError } from "./custom-api";
import { StatusCodes } from "http-status-codes";

export class UnAuthenticatedError extends CustomApiError {
  statusCode: typeof StatusCodes.UNAUTHORIZED;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
