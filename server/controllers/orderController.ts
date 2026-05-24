import { Request, Response } from "express";
import { checkPersmissions } from "../utils/checkPermissions";
import { Product } from "../models/Product";
import Order from "../models/Order";
import { BadRequestError, NotFoundError } from "../errors";
import { StatusCodes } from "http-status-codes";

export async function getAllOrders(req: Request, res: Response) {
  const orders = await Order.find({});
  if (!orders || orders.length < 1) throw new NotFoundError("No orders found");
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
}
export async function getSingleOrder(req: Request, res: Response) {
  const orderId = req.params.id;
  if (!orderId) throw new BadRequestError("Please provide order id");
  const order = await Order.findOne({ _id: orderId });
  if (!order) throw new NotFoundError(`No order with id : ${orderId}`);
  checkPersmissions(req.user, order.user.toString());
  res.status(StatusCodes.OK).json({ order });
}
export async function getCurrentUserOrders(req: Request, res: Response) {
  const orders = await Order.find({ user: req.user.userId });
  if (!orders || orders.length < 1)
    throw new NotFoundError(
      `No orders associated to user : ${req.user.userId}`,
    );
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
}

const fakeStripeApi = async ({
  amount,
  currency,
}: {
  amount: number;
  currency: "usd";
}) => {
  const clientSecrect = "topSecret!!";
  return { clientSecrect, amount };
};
export async function createOrder(req: Request, res: Response) {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1)
    throw new BadRequestError("Please provide cart items");
  if (!tax || !shippingFee)
    throw new BadRequestError("Please provide tax and shipping fee");
  let orderItems: any[] = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct)
      throw new NotFoundError(`No product with id : ${item.product}`);
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // add item to order and calculate subtotal accumulatvely
    orderItems.push(singleOrderItem);
    subtotal += item.amount * price;
  }

  const total: number = subtotal + tax + shippingFee;
  // setting up fake stripe payment process
  const paymentIntent = await fakeStripeApi({
    amount: total,
    currency: "usd",
  });
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.clientSecrect,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
}
export async function updateOrder(req: Request, res: Response) {
  const orderId = req.params.id;
  if (!orderId) throw new BadRequestError("Please provide order Id");
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order)
    throw new NotFoundError(`Couldn't found order with order Id: ${orderId}`);
  checkPersmissions(req.user, order.user.toString());
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  order.save();
  res.status(StatusCodes.OK).json({ order, msg: "Order updated" });
}
