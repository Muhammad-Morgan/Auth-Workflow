import { Response } from "express";

type UserPropsAndRes = {
  userId: any;
  name: string;
  role: "admin" | "user";
};

export const createTokenUser = (user: UserPropsAndRes) => {
  return {
    userId: user.userId as string,
    name: user.name,
    role: user.role,
  };
};
