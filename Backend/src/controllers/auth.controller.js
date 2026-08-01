import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import { sendTokens } from "../utils/sendtoken.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const register = async (req, res, next) => {
  console.log(req.body);
  try {
    const { email, contact, password, fullname, isSeller, storeName } = req.body;

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
      storeName: isSeller ? (storeName || fullname) : undefined, 
    });

    return await sendTokens(user, res, "Registered successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

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

    res.redirect("http://localhost:5174/");
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  const user = req.user;
  try {
    res.status(200).json({
      message: "User fetched successfully",
      success: true,
      user: {
        id: user._id,
        email: user.email,
        contact: user.contact,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 1. UPDATE PROFILE (Name, Contact, and Optional Password)
export const updateProfile = async (req, res) => {
  try {
    const { fullname, contact, currentPassword, newPassword, storeName } = req.body;
    const user = await userModel.findById(req.user._id).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullname) user.fullname = fullname;
    if (contact) user.contact = contact;

    if (user.role === "seller" && storeName) {
      user.storeName = storeName;
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password incorrect" });
      }

      user.password = newPassword;
    }

    await user.save();
    user.password = undefined; 
    res.status(200).json({ 
        message: "Profile updated successfully",
        user: user 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Email parameter is required." });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await userModel.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    if (user.googleId) {
      return res.status(400).json({
        message: "This account is managed via Google. Please sign in with Google.",
      });
    }

    // Generate 6 character hex token
    const resetToken = crypto.randomBytes(3).toString("hex").toUpperCase();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // 🔥 FIX: Updated Subject to sound more natural
    const subject = "Stylix | Your Password Verification Code";
    
    // 🔥 FIX: Ensure the sendEmail function in email.util.js uses 'html' not 'text'
    const htmlMessage = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #1c1917; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 20px;">
        <h2 style="font-size: 28px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.05em; margin-bottom: 32px; color: #1c1917; margin-top: 0;">Stylix.</h2>

        <p style="font-size: 14px; line-height: 1.6; font-weight: 500; color: #44403c; margin-bottom: 32px;">
          Hello ${user.fullname || "Member"},<br/><br/>
          We received a request to access your account. Please use the verification code below to proceed:
        </p>

        <div style="background-color: #f7f6f4; border: 1px solid #e7e5e4; padding: 24px; text-align: center; border-radius: 16px; margin-bottom: 32px;">
          <span style="font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 0.15em; color: #1c1917;">${resetToken}</span>
        </div>

        <p style="font-size: 12px; color: #78716c; line-height: 1.6; margin-bottom: 40px;">
          This code is valid for 60 minutes. If you didn't request this action, you can safely ignore this email.
        </p>

        <hr style="border: 0; border-top: 1px solid #e7e5e4; margin-bottom: 24px;" />
        <p style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #1c1917; margin: 0;">The Stylix Team</p>
      </div>
    `;

    // Execute email transmission
    sendEmail(cleanEmail, subject, htmlMessage).catch((mailError) => {
      console.error("Email dispatch failed:", mailError);
    });

    return res.status(200).json({ message: "Verification code has been dispatched to your email." });
    
  } catch (error) {
    console.error("Forgot Password Module Error:", error);
    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

// 3. RESET PASSWORD 
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required." });
    }

    const normalizedToken = String(token).trim().toUpperCase();
    const safePassword = String(newPassword).trim();

    if (safePassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Find user with active token
    const user = await userModel.findOne({
      resetPasswordToken: normalizedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    // 🔥 Assign new password (pre-save hook will hash it automatically)
    user.password = safePassword;
    
    // Clear tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return res.status(200).json({ message: "Password has been successfully updated." });
  } catch (error) {
    console.error("Reset Password Module Error:", error);
    return res.status(500).json({ message: "Server error occurred during password reset." });
  }
};
