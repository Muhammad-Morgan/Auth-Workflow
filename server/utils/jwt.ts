import jwt from "jsonwebtoken";
import { StringValue } from "ms";
import { Response } from "express";

type PayloadProps = {
  tokenUser: { userId: string; name: string; role: "admin" | "user" };
  refreshToken?: string;
  res: Response;
};

export const createJWT = ({
  payload,
}: {
  payload: {
    user: { userId: string; name: string; role: "admin" | "user" };
    refreshToken?: string;
  };
}) => {
  const token = jwt.sign(
    {
      name: payload.user.name,
      userId: payload.user.userId,
      role: payload.user.role,
    },
    process.env.JWT_SECRET!,
  );
  return token;
};

export const isTokenValid = ({ token }: { token: string }) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  return decoded;
};

export const attachCookiesToResponse = ({
  payload,
}: {
  payload: PayloadProps;
}) => {
  const oneDay = 60 * 60 * 24 * 1000;

  // access token
  const accessToken = createJWT({ payload: { user: payload.tokenUser } });
  payload.res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    maxAge: 1000 * 60 * 2,
  });

  // refresh token
  if (payload.refreshToken) {
    const refreshToken = createJWT({
      payload: { user: payload.tokenUser, refreshToken: payload.refreshToken },
    });
    payload.res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
      expires: new Date(Date.now() + oneDay),
    });
  }
};
