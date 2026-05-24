import mongoose from "mongoose";

// Add this before connecting to suppress the warning
mongoose.set("strictQuery", false);

export const connectDB = (uri: string): Promise<typeof mongoose> => {
  return mongoose.connect(uri);
};
