import { Request, Response } from "express";
import { User } from "../models/User";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { createTokenUser } from "../utils/createTokenUser";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendVerficationEmail";
import { attachCookiesToResponse } from "../utils/jwt";
import Token from "../models/Token";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail";

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

  const tokenUser = createTokenUser({
    name: existingUser.name,
    userId: existingUser._id,
    role: existingUser.role,
  });
  let refreshToken = "";

  // check if there is existing accessToken for user
  const existingToken = await Token.findOne({ user: existingUser._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) throw new UnAuthenticatedError("Invalid Credentials");
    refreshToken = existingToken.refreshToken;
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
    return;
  }

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
  await Token.findOneAndDelete({ user: req.user?.userId });

  res.cookie("accessToken", "", {
    expires: new Date(Date.now()), // Expires now.
    httpOnly: true,
  });
  res.cookie("refreshToken", "", {
    expires: new Date(Date.now()), // Expires now.
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ msg: "logout user" });
};
const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Please provide valid email");

  // we wanna find the user
  const user = await User.findOne({ email });
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");
    const forwardedProtocol = req.get("x-forwarded-proto");
    const forwardedHost = req.get("x-forwarded-host");
    // send email
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin: `${forwardedProtocol}://${forwardedHost}`,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email for reset password link" });
};
const resetPassword = async (req: Request, res: Response) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password)
    throw new BadRequestError("Please provide all values");

  const user = await User.findOne({ email });
  if (user) {
    const currentDate = new Date();
    if (
      user?.passwordToken === token &&
      currentDate < user.passwordTokenExpirationDate!
    ) {
      user.password = password;
      user.passwordTokenExpirationDate = null;
      user.passwordToken = null;
      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ msg: "" });
};
export { register, login, logout, verifyEmail, forgotPassword, resetPassword };
