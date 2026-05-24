import { Request, Response } from "express";
import { Product } from "../models/Product";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors";
import path from "node:path";

export const getAllProducts = async (req: Request, res: Response) => {
  const products = await Product.find({ user: req.user.userId });
  if (products.length === 0)
    throw new NotFoundError("No products found for this user");
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

export const createProduct = async (req: Request, res: Response) => {
  // we wanna attach the current (admin) userId to the body through user prop which matches the schema
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

export const getSingleProduct = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product)
    throw new NotFoundError(`No product with ID ${productId} was found`);
  res.status(StatusCodes.OK).json({ product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const product = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
  });
  if (!product)
    throw new NotFoundError(`No product with ID ${productId} was found`);
  res.status(StatusCodes.OK).json({ product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const productId = req.params.id;
  const product = await Product.findOne({ _id: productId });
  if (!product)
    throw new NotFoundError(`No product with ID ${productId} was found`);
  await product.remove();
  res
    .status(StatusCodes.OK)
    .json({ msg: `Product ID ${productId} has been deleted` });
};

export const uploadImage = async (req: Request, res: Response) => {
  // we make sure that there is a file
  if (!req.files) throw new BadRequestError("No file uploaded");
  // we grab the file and make sure it's an image by checking mimetype with startsWith("image"), and check for size
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image"))
    throw new BadRequestError("Please upload an image file");
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize)
    throw new BadRequestError(
      `please upload an image smaller than max size of ${maxSize / 1024 / 1024}MB`,
    );
  // we wanna save the file to our public/uploads, and use the path module to get path to the file.
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`,
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `uploads/${productImage.name}` });
};
