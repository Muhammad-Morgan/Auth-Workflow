import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";

export const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // define custom error model.
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong...",
  };

  // check for dups
  if (err.code && err.code === 11000) {
    // accessing 'keyValue' property, and add it to customError.message. Then adding bad_request statusCode

    customError["message"] =
      `Duplicate value entered for ${Object.keys(err.keyValue)} field. Choose another value.`;
    customError["statusCode"] = StatusCodes.BAD_REQUEST;
  }

  // validation errors
  if (err.name === "ValidationError") {
    // get all values for keys in 'errors' object
    customError["message"] = Object.values(err.console.errors)
      .map((item: any) => item.message)
      .join(",");
    customError["statusCode"] = StatusCodes.BAD_REQUEST;
  }

  // cast errors
  if (err.name === "CastError") {
    customError["message"] = `No item found with id: ${err.value}`;
    customError["statusCode"] = StatusCodes.NOT_FOUND;
  }

  // send back the customError
  return res.status(customError.statusCode).json({ msg: customError.message });
};
