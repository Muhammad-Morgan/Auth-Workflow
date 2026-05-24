import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

// importing req,res types
import { Request, Response } from "express";

// importing express
import express from "express";
const app = express();

// rest of packages
import morgan from "morgan";
import cookieParser from "cookie-parser";
import uploadFile from "express-fileupload";

// DB
import { connectDB } from "./db/connect";

// error handler importing
import { errorHandlerMiddleware } from "./middleware/error-handler";
import { notFoundMiddleware } from "./middleware/not-foundmiddleware";

// importing routes
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";
import { productRouter } from "./routes/product";
import { reviewRouter } from "./routes/review";
import { orderRouter } from "./routes/order";

// common middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(uploadFile());

//security packages
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";

app.set("trust proxy", 1);
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }));
app.use(helmet());
app.use(xss());
app.use(cors());
app.use(mongoSanitize());

// testing route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("<h1>E-Commerce Home Page</h1>");
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// error fallback - Order is IMP
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port: number = (process.env.PORT as unknown as number) || 5000;

const start = async (): Promise<void> => {
  try {
    // here is the mongoDB connection...
    await connectDB(process.env.MONGODB_URI!);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();
