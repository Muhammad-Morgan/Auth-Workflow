import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from "../controllers/userController";

import express from "express";
const router = express.Router();
import { authUser, authorizePermissions } from "../middleware/authentication";

// for middleware I guess
// here for the args. We add the roles that can perform such actions
router.get("/", authUser, authorizePermissions("admin"), getAllUsers);

router.get("/showMe", authUser, showCurrentUser);

router.patch("/updateUser", authUser, updateUser);
router.patch("/updateUserPassword", authUser, updateUserPassword);

// if this route was before any of the others disregarding "/" of course, it would've caused unnecessary bugs. Because all the routes beneath it would've ben treated as id and hence the whole functionality fails!

router.get("/:id", authUser, getSingleUser);

export { router as userRouter };
