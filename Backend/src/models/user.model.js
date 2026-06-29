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
        return !this.googleId; // required only for normal users
      },
      unique: true,
      sparse: true, 
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // not required for Google users
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
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      }
    ],

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

// 🔐 Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next(); // 🔥 Clean practice: next() call karna zaroori hota hai middleware mein
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);
export default userModel;