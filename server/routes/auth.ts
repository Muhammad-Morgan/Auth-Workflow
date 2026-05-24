import express from "express";
export const authRouter = express.Router();

import { register, login, logout } from "../controllers/authController";

authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.post("/register", register);
