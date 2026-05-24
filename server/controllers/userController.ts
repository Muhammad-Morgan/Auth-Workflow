import { Request, Response } from "express";
import { User } from "../models/User";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors";
import { checkPersmissions } from "../utils/checkPermissions";
import { createTokenUser } from "../utils/createTokenUser";

// That's an admin action
const getAllUsers = async function name(req: Request, res: Response) {
  const users = await User.find({ role: "user" }).select("-password");
  if (users.length === 0)
    return res
      .status(StatusCodes.OK)
      .json({ users: [], msg: "no users found..." });
  res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async function name(req: Request, res: Response) {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) throw new NotFoundError(`No user with ID: ${id}`);
  checkPersmissions(req.user, String(user._id));
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async function name(req: Request, res: Response) {
  res.status(StatusCodes.OK).json({ user: req.user });
};
// with document.save()
const updateUser = async function name(req: Request, res: Response) {
  const { name, email } = req.body;
  if (!name || !email)
    throw new BadRequestError("name and email are required.");
  const updatedUser = await User.findOne({ _id: req.user.userId });
  if (!updatedUser)
    throw new NotFoundError(`Couldn't find a user with ID: ${req.user.userId}`);
  updatedUser.email = email;
  updatedUser.name = name;
  await updatedUser.save();
  const tokenUser = {
    res,
    name,
    userId: req.user.userId,
    role: updatedUser.role,
  };
  createTokenUser(tokenUser);
  res.status(StatusCodes.OK).json({
    name,
    userId: req.user.userId,
  });
};

// with findOneAndUpdate
// const updateUser = async function name(req: Request, res: Response) {
//   const { name, email } = req.body;
//   if (!name || !email)
//     throw new BadRequestError("name and email are required.");
//   const updatedUser = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     {
//       name,
//       email,
//     },
//   );
//   if (!updatedUser)
//     throw new NotFoundError(`no user with ID: ${req.user.userId} was found`);
//   const tokenUser = {
//     res,
//     name,
//     userId: req.user.userId,
//     role: updatedUser.role,
//   };
//   createTokenUser(tokenUser);
//   res.status(StatusCodes.OK).json({
//     name,
//     userId: req.user.userId,
//   });
// };

const updateUserPassword = async function name(req: Request, res: Response) {
  // we get the id from req.user
  const userId = req.user.userId;
  const { password, newPassword } = req.body;
  if (!userId || !newPassword) throw new BadRequestError("Bad request");

  // we check if such user exists
  const existUser = await User.findById(userId);
  if (!existUser) throw new NotFoundError(`no user found with id: ${userId}`);

  // check if old password matches with user.comparePassword using instance method
  const isMatch = await existUser?.comparePassword(password);
  if (!isMatch) throw new UnAuthenticatedError("wrong password");

  // we update the password
  existUser.password = newPassword;
  await existUser.save();
  res.status(StatusCodes.OK).json({
    user: {
      userId: existUser._id,
      name: existUser.name,
      role: existUser.role,
    },
  });
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
