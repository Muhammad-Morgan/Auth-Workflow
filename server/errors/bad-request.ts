import { CustomApiError } from "./custom-api";
import { StatusCodes } from "http-status-codes";

export class BadRequestError extends CustomApiError {
  statusCode: typeof StatusCodes.BAD_REQUEST;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}
