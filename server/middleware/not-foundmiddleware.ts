import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response<any, Record<string, any>> =>
  res.status(StatusCodes.NOT_FOUND).send("Route does not exist");
