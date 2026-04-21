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
      sparse: true, // important when field is optional + unique
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

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

// 🔐 Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
const userModel = mongoose.model("user", userSchema);
export default userModel;
