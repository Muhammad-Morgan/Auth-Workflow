import { NextFunction, Request, Response } from "express";
import { UnAuthenticatedError, UnAuthorizedError } from "../errors";
import { isTokenValid } from "../utils/jwt";
import Token from "../models/Token";
import { attachCookiesToResponse } from "../utils/jwt";

export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = isTokenValid({ token: accessToken });
      req.user = payload;
      return next();
    }
    const payload = isTokenValid({ token: refreshToken }) as any;
    const existingToken = await Token.findOne({
      user: payload.userId,
      refreshToken,
    });
    if (!existingToken || !existingToken?.isValid)
      throw new UnAuthenticatedError("Authentication Invalid - MW");
    attachCookiesToResponse({
      payload: { tokenUser: payload, refreshToken, res },
    });
    req.user = payload;
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
