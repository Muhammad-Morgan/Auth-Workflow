import { CustomApiError } from "./custom-api";
import { StatusCodes } from "http-status-codes";

export class NotFoundError extends CustomApiError {
  statusCode: typeof StatusCodes.NOT_FOUND;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}
