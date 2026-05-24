import { Response } from "express";
import { attachCookiesToResponse } from "./jwt";

type UserPropsAndRes = {
  userId: any;
  name: string;
  res: Response;
  role: "admin" | "user";
};

export const createTokenUser = (user: UserPropsAndRes) => {
  const tokenUser = {
    userId: user.userId,
    name: user.name,
    role: user.role,
  };
  attachCookiesToResponse({ payload: { tokenUser, res: user.res } });
};
