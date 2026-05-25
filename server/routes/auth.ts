import express from "express";
export const authRouter = express.Router();

import {
  register,
  login,
  logout,
  verifyEmail,
} from "../controllers/authController";

authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/register", register);
