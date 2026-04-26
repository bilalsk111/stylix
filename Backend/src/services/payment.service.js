import Razorpay from "razorpay";
import {config} from "../config/config.js";

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

const createOrderService = async ({ amount, currency = "INR", receipt }) => {
  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt,
  };
  return await razorpay.orders.create(options);
};