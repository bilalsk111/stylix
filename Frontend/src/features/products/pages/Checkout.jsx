import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { ChevronRight, ChevronLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { createOrder, verifyPayment } from "../../cart/services/cart.api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth); 
  const cartItems = useSelector((state) => state.cart?.items || []);
  
  const isBuyNow = location.state?.buyNowItem != null;
  const checkoutItems = isBuyNow ? [location.state.buyNowItem] : cartItems;

  const [formData, setFormData] = useState({
    firstName: user?.fullname?.split(" ")[0] || "",
    lastName: user?.fullname?.split(" ")[1] || "",
    email: user?.email || "",
    phone: user?.contact || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const { subtotal, isStockAvailable } = useMemo(() => {
    let total = 0;
    let stockStatus = true;

    checkoutItems.forEach((item) => {
      const product = item.product || {};
      const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;
      const variantsList = Array.isArray(product?.variants) ? product.variants : (product?.variants ? [product.variants] : []);
      const variant = variantsList.find((v) => v._id?.toString() === variantId?.toString()) || item.variant || {};

      const price = variant?.price?.amount || product?.price?.amount || 0;
      total += price * item.quantity;

      if (variant.stock < item.quantity) {
        stockStatus = false;
      }
    });

    return { subtotal: total, isStockAvailable: stockStatus };
  }, [checkoutItems]);

  const shippingThreshold = 2000;
  const shipping = subtotal >= shippingThreshold ? 0 : 150;
  const totalAmount = subtotal + shipping;
  const currency = checkoutItems[0]?.product?.price?.currency || "INR";

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, address, city, state, pincode } = formData;
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !pincode) {
      toast.error("Please fill in all shipping details.");
      return false;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!isStockAvailable) {
      toast.error("Some items are out of stock. Please check your bag.");
      return;
    }
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Check your connection.");
        setIsProcessing(false);
        return;
      }

      toast.loading("Securing your order...", { id: "payment-toast" });

      const orderPayload = {
        isBuyNow: isBuyNow,
        singleItem: isBuyNow ? {
          productId: checkoutItems[0].product._id,
          variantId: checkoutItems[0].variant._id || checkoutItems[0].variant,
          quantity: checkoutItems[0].quantity
        } : null,
        items: checkoutItems.map(item => {
          const v = typeof item.variant === 'object' ? item.variant : { _id: item.variant };
          return {
            productId: item.product._id,
            variantId: v._id,
            quantity: item.quantity,
            price: {
              amount: v?.price?.amount || item.product?.price?.amount,
              currency: "INR"
            }
          };
        }),
        shippingAddress: formData
      };

      const orderResponse = await createOrder(orderPayload);

      if (!orderResponse.success) {
         toast.error("Failed to create order.", { id: "payment-toast" });
         setIsProcessing(false);
         return;
      }

      const { order: rzpOrder, dbOrderId } = orderResponse;
      toast.dismiss("payment-toast");

      const options = {
        key: "rzp_test_ShyXwSBMDuYY3u", 
        amount: rzpOrder.amount, 
        currency: rzpOrder.currency,
        name: "STYLIX",
        description: "Premium Apparel Purchase",
        order_id: rzpOrder.id,
        
        handler: async function (response) {
          try {
            toast.loading("Verifying secure payment...", { id: "verify-toast" });
            
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: dbOrderId,
              isBuyNow: isBuyNow
            };

            const verifyRes = await verifyPayment(verifyPayload);

            if (verifyRes.success) {
              toast.dismiss("verify-toast");
              // 🔥 FIX: Navigating to success page with full order details
              navigate("/success", {
                state: {
                  orderId: dbOrderId,
                  items: checkoutItems,
                  totalAmount,
                  currency,
                  shippingAddress: formData,
                  transactionId: response.razorpay_payment_id
                }
              });
            } else {
              toast.error(verifyRes.message || "Verification failed!", { id: "verify-toast" });
            }
          } catch (err) {
             console.error(err);
             toast.error("Server error during verification.", { id: "verify-toast" });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#ccff00",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', function (response){
         console.error("Payment Failed", response.error);
         toast.error("Payment Failed: " + response.error.description);
      });

      razorpayInstance.open();
      setIsProcessing(false);

    } catch (error) {
      console.error(error);
      toast.error("Payment gateway error.", { id: "payment-toast" });
      setIsProcessing(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f6f4] flex flex-col items-center justify-center">
        <p className="text-stone-400 text-[11px] uppercase tracking-[0.5em] font-bold mb-6">No assets to checkout</p>
        <button onClick={() => navigate("/")} className="bg-stone-900 text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-md">Return to Archive</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-stone-900 font-sans selection:bg-[#ccff00] selection:text-stone-900 pt-[100px] lg:pt-[130px] pb-24">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-12 relative">
          <button onClick={() => navigate(-1)} className="absolute -top-8 left-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">
            <ChevronLeft size={12} /> Go Back
          </button>
          
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic mb-4">Secure Checkout</h1>
          <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-stone-400">
            <span className="cursor-pointer hover:text-stone-900" onClick={() => navigate("/bag")}>Bag</span> 
            <ChevronRight size={10} />
            <span className="text-stone-900">Information & Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          <div className="w-full lg:w-[55%]">
            <form id="checkout-form" onSubmit={handlePayment} className="space-y-10">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-4">
                  <div className="bg-stone-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-stone-900">Contact Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className="w-full bg-white border border-stone-200 px-4 py-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors rounded-lg shadow-sm" />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className="w-full bg-white border border-stone-200 px-4 py-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors rounded-lg shadow-sm" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" className="w-full bg-white border border-stone-200 px-4 py-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors rounded-lg shadow-sm md:col-span-2" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number (10 Digits)" className="w-full bg-white border border-stone-200 px-4 py-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors rounded-lg shadow-sm md:col-span-2" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-4">
                  <div className="bg-stone-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-stone-900">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Street Address / Flat No." className="w-full bg-white border border-stone-200 px-4 py-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors rounded-lg shadow-sm md:col-span-2" />
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full bg-white border border-stone-200 px-4 py-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors rounded-lg shadow-sm" />
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full bg-white border border-stone-200 px-4 py-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors rounded-lg shadow-sm" />
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN Code" className="w-full bg-white border border-stone-200 px-4 py-3.5 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors rounded-lg shadow-sm md:col-span-2" />
                </div>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-[45%]">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-sm sticky top-24">
              <h2 className="text-sm font-black uppercase tracking-widest text-stone-900 mb-6 border-b border-stone-100 pb-4">
                Order Summary {isBuyNow && <span className="text-[#a3cc00] ml-2 tracking-normal">(Direct Buy)</span>}
              </h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {checkoutItems.map((item, idx) => {
                  const product = item.product || {};
                  const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;
                  const variantsList = Array.isArray(product?.variants) ? product.variants : (product?.variants ? [product.variants] : []);
                  const variant = variantsList.find((v) => v._id?.toString() === variantId?.toString()) || item.variant || {};
                  
                  const displayImage = variant?.images?.[0]?.url || product?.images?.[0]?.url;
                  const price = variant?.price?.amount || product?.price?.amount || 0;

                  return (
                    <div key={idx} className="flex gap-4 items-center p-3 border border-stone-100 rounded-xl bg-stone-50/50">
                      <div className="w-16 h-20 bg-stone-100 rounded-md overflow-hidden shrink-0">
                        <img src={displayImage} alt="product" className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs font-black uppercase tracking-tight text-stone-900 line-clamp-1 mb-1">{variant.title || product.title}</h3>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                          <span>Qty: {item.quantity}</span>
                          {Object.values(variant.attributes || {}).map((val, i) => (
                            <span key={i}>• {val}</span>
                          ))}
                        </div>
                        <span className="text-sm font-bold text-stone-900">{currency} {price * item.quantity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-6 border-t border-stone-100 mb-6">
                <div className="flex justify-between text-xs font-medium text-stone-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-stone-900 font-bold">{currency} {subtotal}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-stone-500 uppercase tracking-widest">
                  <span>Shipping</span>
                  {shipping === 0 ? <span className="text-[#a3cc00] font-black">FREE</span> : <span className="text-stone-900 font-bold">{currency} {shipping}</span>}
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-stone-100 mb-8">
                <span className="text-sm font-black uppercase tracking-widest text-stone-900">Total</span>
                <span className="text-3xl font-black text-stone-900 tracking-tighter">{currency} {totalAmount}</span>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing || !isStockAvailable}
                className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 shadow-md
                  ${isProcessing || !isStockAvailable 
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed" 
                    : "bg-[#ccff00] text-stone-900 hover:bg-[#bbf000] hover:shadow-lg active:scale-[0.98]"}`}
              >
                {isProcessing ? "Processing..." : (
                  <>
                    <CreditCard size={16} fill="currentColor" className="text-stone-900" />
                    Pay {currency} {totalAmount}
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 text-stone-400 border-t border-stone-100 pt-6">
                <div className="flex items-center gap-1.5"><ShieldCheck size={14} /><span className="text-[8px] font-black uppercase tracking-widest">256-bit Secure</span></div>
                <div className="w-px h-3 bg-stone-200"></div>
                <div className="flex items-center gap-1.5"><Lock size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Encrypted Checkout</span></div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;