import express from "express";
import {
  createOrder,
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  updateOrder,
} from "../controllers/orderController";
import { authorizePermissions, authUser } from "../middleware/authentication";

const router = express.Router();

router
  .route("/")
  .get(authUser, authorizePermissions("admin"), getAllOrders)
  .post(authUser, createOrder);

router.route("/showallmyorders").get(authUser, getCurrentUserOrders);

router.route("/:id").get(authUser, getSingleOrder).patch(authUser, updateOrder);

export { router as orderRouter };
