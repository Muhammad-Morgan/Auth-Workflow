import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

// adding the instance methods to the types
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  comparePassword(candidatePassword: string): Promise<boolean>;
}
const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Passowrd should be at least 6 digits"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

// adding Schema.pre middleware
UserSchema.pre(
  "save" as any,
  async function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (this.modifiedPaths().includes("password")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  },
);

// comparing password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};
export const User = mongoose.model("User", UserSchema);
