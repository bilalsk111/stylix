import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import { sendTokens } from "../utils/sendtoken.js";

export const register = async (req, res, next) => {
  try {
    const { email, contact, password, fullname, isSeller } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "contact";

      return res.status(409).json({
        success: false,
        message:
          field === "email"
            ? "Email already exists"
            : "Phone number already exists",
      });
    }

    const user = await userModel.create({
      email,
      contact,
      password,
      fullname,
      role: isSeller ? "seller" : "buyer",
    });

    return await sendTokens(user, res, "Registered successfully", 201);
  } catch (err) {
    next(err);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel
      .findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    return await sendTokens(user, res, "Login successful");
  } catch (err) {
    next(err);
  }
};


export const googleCallback = async (req, res, next) => {
  try {
    const { id, emails, displayName, photos } = req.user;

    const email = emails[0].value;
    // const profilePic = photos?.[0]?.value || "";

    let user = await userModel.findOne({ email });


    if (!user) {
      user = await userModel.create({
        googleId: id,
        email,
        fullname: displayName,
        // profilePic,
      });
    } else {
      if (!user.googleId) user.googleId = id;
      if (!user.profilePic) user.profilePic = profilePic;

      await user.save();
    }

    return await sendTokens(user, res, "Google login success");

    res.redirect("http://localhost:5173/");
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  const user = req.user
  try {
       res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};