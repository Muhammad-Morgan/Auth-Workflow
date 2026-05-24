import { NextFunction, Request, Response } from "express";
import { UnAuthenticatedError, UnAuthorizedError } from "../errors";
import { isTokenValid } from "../utils/jwt";

export const authUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.signedCookies.token;
  if (!token) throw new UnAuthenticatedError("Authentication failed - MW");

  try {
    const payload = isTokenValid({ token }) as {
      name: string;
      userId: string;
      iat: number;
      role: "admin" | "user";
    };
    req.user = {
      name: payload.name,
      userId: payload.userId,
      role: payload.role,
    };
    next();
  } catch (error) {
    throw new UnAuthenticatedError("Authentication error caught - MW");
  }
};

export const authorizePermissions = (...roles: string[]) => {
  // return another function to be used as callback
  return (req: Request, res: Response, next: NextFunction) => {
    // checking for roles
    if (!roles.includes(req.user.role))
      throw new UnAuthorizedError("Authorization failed - MW");
    next();
  };
};
