import { Request, Response } from "express";
import { User } from "../models/User";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { createTokenUser } from "../utils/createTokenUser";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail";
import { sendVerificationEmail } from "../utils/sendVerficationEmail";
import { attachCookiesToResponse } from "../utils/jwt";
import Token from "../models/Token";

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

  // creating token - 5/25/2026 we won't be sending the token. we are sending back an email

  // we will be sending for now a fake verification token, bec later we will be setting it up with crypto library

  const verificationToken = crypto.randomBytes(40).toString("hex");
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });
  // send email
  const forwardedProtocol = req.get("x-forwarded-proto");
  const forwardedHost = req.get("x-forwarded-host");

  await sendVerificationEmail({
    email: user.email,
    verificationToken: user.verificationToken,
    name: user.name,
    origin: `${forwardedProtocol}://${forwardedHost}`,
  });
  res.status(StatusCodes.CREATED).json({
    msg: "Success! Please check your email to verify the account",
  });
};
const verifyEmail = async (req: Request, res: Response) => {
  const { verificationToken, email } = req.body;
  const existingUser = await User.findOne({ email });
  if (!existingUser)
    throw new UnAuthenticatedError(`No user registered with ${email}`);
  if (verificationToken !== existingUser.verificationToken)
    throw new UnAuthenticatedError("Invalid token");
  existingUser.isVerified = true;
  existingUser.verified = new Date();
  existingUser.verificationToken = "";
  existingUser.save();
  res.status(StatusCodes.OK).json({ msg: "email verified" });
};
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError("Please fill the credentials");

  const existingUser = await User.findOne({ email });
  if (!existingUser) throw new UnAuthenticatedError("No user found");

  const isMatch = await existingUser.comparePassword(password);
  if (!isMatch) throw new UnAuthenticatedError("Wrong password");

  if (!existingUser.isVerified)
    throw new UnAuthenticatedError("Please verify your account");
  // calling attach...
  const tokenUser = createTokenUser({
    name: existingUser.name,
    userId: existingUser._id,
    role: existingUser.role,
  });

  let refreshToken = "";
  // check if there is existing accessToken for user

  // create refreshToken
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  const refreshUserToken = {
    refreshToken,
    ip,
    userAgent,
    user: existingUser._id as string,
  };

  await Token.create(refreshUserToken);

  attachCookiesToResponse({
    payload: { tokenUser, refreshToken, res },
  });

  res.status(StatusCodes.OK).json({
    user: {
      name: tokenUser.name,
      userId: tokenUser.userId,
      role: tokenUser.role,
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
export { register, login, logout, verifyEmail };
