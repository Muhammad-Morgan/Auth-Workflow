import express from "express";

const router = express.Router();

import { authUser } from "../middleware/authentication";
import {
  getAllReviews,
  getSingleReview,
  createReview,
  updateReview,
  deleteReview,
  getSingleProductReview,
} from "../controllers/reviewController";

router.route("/").get(getAllReviews).post(authUser, createReview);

router
  .route("/:id")
  .get(getSingleReview)
  .patch(authUser, updateReview)
  .delete(authUser, deleteReview);

router.route("/:id/productreviews").get(getSingleProductReview);

export { router as reviewRouter };
