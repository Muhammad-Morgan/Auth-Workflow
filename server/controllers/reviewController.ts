import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../errors";
import Review from "../models/Review";
import { Product } from "../models/Product";
import { checkPersmissions } from "../utils/checkPermissions";

export const getAllReviews = async (req: Request, res: Response) => {
  const reviews = await Review.find({})
    .populate("product", "name company price")
    .populate("user", "name");
  if (reviews.length === 0) throw new NotFoundError("No reviews found");
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

export const getSingleReview = async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new NotFoundError(`Couldn't find a review with ID: ${reviewId}`);
  res.status(StatusCodes.OK).json({ review });
};

export const createReview = async (req: Request, res: Response) => {
  const productId = req.body.product;
  if (!productId) throw new BadRequestError("Please provide a product ID");
  // check if a product exists
  const isValidProduct = await Product.findById(productId);
  if (!isValidProduct)
    throw new BadRequestError(`No product with ID: ${productId}`);
  req.body.user = req.user.userId;
  // check if that user already left a review
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted)
    throw new BadRequestError("a review was already provided");
  const review = await Review.create(req.body);
  res.status(StatusCodes.OK).json({ review });
};

export const updateReview = async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new NotFoundError(`Couldn't find a review with ID: ${reviewId}`);
  const { rating, title, comment } = req.body;
  checkPersmissions(req.user, String(review.user));
  rating && (review.rating = rating);
  title && (review.title = title);
  comment && (review.comment = comment);
  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

export const deleteReview = async (req: Request, res: Response) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review)
    throw new NotFoundError(`Couldn't find a review with ID: ${reviewId}`);
  checkPersmissions(req.user, String(review.user));
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: "review deleted successfully" });
};

export const getSingleProductReview = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
