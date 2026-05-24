import mongoose from "mongoose";
const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
      maxlength: 100,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true },
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true }); // a user with userId: 123 can leave for a product with productId: 456 only 1 review

ReviewSchema.statics.calculateAverageRate = async function (
  this: any,
  productId: mongoose.Types.ObjectId,
) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  // updating product
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
        numOfReviews: result[0]?.numOfReviews || 0,
      },
    );
  } catch (error) {
    console.log(error);
  }
};

// running our static method on both save and delete
ReviewSchema.post("save", async function (this: any) {
  await this.constructor.calculateAverageRate(this.product);
});

ReviewSchema.post("remove", async function (this: any) {
  await this.constructor.calculateAverageRate(this.product);
});

export default mongoose.model("Review", ReviewSchema);
