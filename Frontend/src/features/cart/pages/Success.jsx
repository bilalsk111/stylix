import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Package, MapPin, CreditCard, ArrowRight, Copy } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.3 },
  },
};

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  // Security check
  useEffect(() => {
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderData.orderId);
    toast.success("Order ID Copied!", {
      style: { background: "#1c1917", color: "#ccff00", borderRadius: "0px", fontSize: "12px", fontWeight: "bold" },
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f6f4] flex flex-col items-center pt-[130px] pb-24 px-6 selection:bg-[#ccff00] selection:text-stone-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl flex flex-col items-center"
      >
        {/* Animated Checkmark SVG */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-[#ccff00] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(204,255,0,0.5)] border-4 border-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1c1917"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M20 6 9 17l-5-5"
                variants={checkVariants}
                initial="hidden"
                animate="visible"
              />
            </svg>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic text-stone-900 mb-3">
            Payment Secured
          </motion.h1>
          
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-stone-500 bg-white px-4 py-2 border border-stone-200 rounded-none w-fit mx-auto cursor-pointer hover:bg-stone-50 transition-colors" onClick={copyOrderId}>
            <span>Order ID: <span className="text-stone-900">{orderData.orderId}</span></span>
            <Copy size={12} className="text-stone-400 hover:text-stone-900" />
          </motion.div>
        </motion.div>

        {/* Premium Receipt Container */}
        <motion.div
          variants={itemVariants}
          className="w-full bg-white border border-stone-200 rounded-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
        >
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ccff00] to-stone-900" />

          <div className="p-8 lg:p-12">
            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 pb-12 border-b border-stone-100 border-dashed">
              
              {/* Shipping Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2.5 text-stone-400">
                  <div className="p-2 bg-stone-50 border border-stone-100"><MapPin size={14} className="text-stone-900"/></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Dispatch Details</span>
                </div>
                <div className="text-xs font-medium text-stone-500 leading-relaxed space-y-1 pl-11">
                  <p className="font-black text-stone-900 text-[13px] uppercase tracking-wide mb-2">
                    {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
                  </p>
                  <p>{orderData.shippingAddress.address}</p>
                  <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.pincode}</p>
                  <p className="mt-2 font-mono text-[10px] bg-stone-100 px-2 py-1 w-fit">{orderData.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2.5 text-stone-400">
                  <div className="p-2 bg-[#ccff00]/20 border border-[#a3cc00]/30"><CreditCard size={14} className="text-[#8cb300]"/></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Ledger Info</span>
                </div>
                <div className="space-y-4 pl-11">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Status</span>
                    <span className="bg-[#ccff00] text-stone-900 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1">Authorized</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">TRX ID</span>
                    <span className="text-[10px] text-stone-900 font-mono font-bold truncate max-w-[120px]">{orderData.transactionId}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Total Settled</span>
                    <span className="text-2xl font-black text-stone-900 leading-none">{orderData.currency} {orderData.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <div className="flex items-center gap-2.5 text-stone-400 mb-8">
                <div className="p-2 bg-stone-50 border border-stone-100"><Package size={14} className="text-stone-900"/></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Secured Assets ({orderData.items.length})</span>
              </div>
              
              <div className="space-y-4">
                {orderData.items.map((item, idx) => {
                  const product = item.product || {};
                  const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;
                  const variantsList = Array.isArray(product?.variants) ? product.variants : (product?.variants ? [product.variants] : []);
                  const variant = variantsList.find((v) => v._id?.toString() === variantId?.toString()) || item.variant || {};
                  const displayImage = variant?.images?.[0]?.url || product?.images?.[0]?.url || "https://via.placeholder.com/150";

                  return (
                    <div key={idx} className="flex gap-5 items-center p-4 bg-stone-50/50 border border-stone-100 hover:bg-stone-50 transition-colors">
                      <div className="w-16 h-20 bg-white rounded-none overflow-hidden shrink-0 border border-stone-200 shadow-sm">
                        <img src={displayImage} alt="item" className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-widest text-stone-900 mb-2">{variant.title || product.title}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-stone-500 uppercase tracking-widest">
                            <span className="bg-stone-200 px-2 py-0.5 text-stone-700">Qty: {item.quantity}</span>
                            {Object.entries(variant.attributes || {}).map(([k, val], i) => (
                              <span key={i} className="border border-stone-200 px-2 py-0.5 bg-white">{val}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-black text-stone-900">
                            {orderData.currency} {((variant?.price?.amount || product?.price?.amount || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 max-w-[250px]">
            <Link 
              to="/profile" 
              className="w-full bg-white text-stone-900 border border-stone-200 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-stone-50 hover:border-stone-900 transition-all shadow-sm"
            >
              View Order History
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 max-w-[250px]">
            <Link 
              to="/" 
              className="w-full bg-stone-900 text-white py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#ccff00] hover:text-stone-900 transition-all shadow-lg shadow-stone-900/20"
            >
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Success;