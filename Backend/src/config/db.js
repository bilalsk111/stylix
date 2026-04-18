// db/connect.js
import mongoose from "mongoose";
import { config } from "../config/config.js";

const connectDB = async () => {
  await mongoose.connect(config.MONGO_URI);
  console.log("MongoDB Connected");
};

export default connectDB