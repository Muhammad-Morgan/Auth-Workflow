import jwt from "jsonwebtoken";
import { StringValue } from "ms";
import { Response } from "express";

type PayloadProps = {
  tokenUser: {
    name: string;
    userId: string;
    role: "admin" | "user";
  };
  res: Response;
};

export const createJWT = ({
  payload,
}: {
  payload: { userId: string; name: string; role: "admin" | "user" };
}) => {
  const token = jwt.sign(
    { name: payload.name, userId: payload.userId, role: payload.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_LIFETIME as StringValue },
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
  const token = createJWT({ payload: payload.tokenUser });

  const oneDay = 60 * 60 * 24 * 1000;
  payload.res.cookie("token", token, {
    expires: new Date(Date.now() + oneDay), // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};
