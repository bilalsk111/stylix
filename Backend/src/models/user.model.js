import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contact: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      unique: true,
      sparse: true, 
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
    },
    fullname: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true },
);

// 🔐 Hash password once on save
userSchema.pre("save", async function () {
  // Agar password modify nahi hua hai, toh seedha wapas laut jao (no next needed)
  if (!this.isModified("password")) return;

  // Hash the password and let the async function resolve naturally
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);
export default userModel;