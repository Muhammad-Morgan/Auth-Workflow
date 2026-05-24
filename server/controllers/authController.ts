import { Request, Response } from "express";
import { User } from "../models/User";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { createTokenUser } from "../utils/createTokenUser";

const register = async (req: Request, res: Response) => {
  // check if email exists already
  const userExist = await User.findOne({ email: req.body.email });
  if (userExist)
    throw new BadRequestError("A user with same email is registered...");

  // create user
  const { name, email, password } = req.body;

  // first registered is admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const user = await User.create({ name, email, password, role });

  // creating token
  const passedUser = {
    userId: user._id.toString(),
    name: user.name,
    role: user.role,
    res,
  };
  createTokenUser(passedUser);
  res.status(StatusCodes.CREATED).json({
    user: { name: user.name, role: user.role, userId: user._id },
  });
};
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError("Please fill the credentials");
  const existingUser = await User.findOne({ email });
  if (!existingUser) throw new UnAuthenticatedError("No user found");
  const isMatch = await existingUser.comparePassword(password);

  if (!isMatch) throw new UnAuthenticatedError("Wrong password");
  // calling attach...
  const user = {
    userId: existingUser._id.toString(),
    name: existingUser.name,
    role: existingUser.role,
    res,
  };
  createTokenUser(user);
  res.status(StatusCodes.OK).json({
    user: {
      name: existingUser.name,
      role: existingUser.role,
      userId: existingUser._id.toString(),
    },
  });
};
const logout = async (req: Request, res: Response) => {
  res.cookie("token", "", {
    expires: new Date(Date.now()), // Expires now.
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ msg: "logout user" });
};
export { register, login, logout };
