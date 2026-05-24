import {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  uploadImage,
  deleteProduct,
} from "../controllers/productController";
import express from "express";
import { authorizePermissions, authUser } from "../middleware/authentication";

const router = express.Router();

router
  .route("/")
  .get(authUser, getAllProducts)
  .post([authUser, authorizePermissions("admin")], createProduct);

router
  .route("/uploadimage")
  .post([authUser, authorizePermissions("admin")], uploadImage);

router
  .route("/:id")
  .get(authUser, getSingleProduct)
  .patch([authUser, authorizePermissions("admin")], updateProduct)
  .delete([authUser, authorizePermissions("admin")], deleteProduct);

export { router as productRouter };
