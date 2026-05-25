import express from "express";
export const authRouter = express.Router();

import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { authUser } from "../middleware/authentication";

authRouter.post("/login", login);
authRouter.delete("/logout", authUser, logout);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/register", register);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
