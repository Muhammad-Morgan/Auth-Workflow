import { CustomApiError } from "./custom-api";
import { StatusCodes } from "http-status-codes";

export class UnAuthorizedError extends CustomApiError {
  statusCode: typeof StatusCodes.FORBIDDEN;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}
