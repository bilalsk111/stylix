import React, { useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { ChevronRight, ChevronLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { createOrder, verifyPayment, deleteOrderApi } from "../../order/service/order.api";

// 1. Load Razorpay
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

//InputField ko component ke BAHAR rakha taaki re-render par focus loose na ho
const InputField = ({ label, ...props }) => (
  <div className="flex flex-col w-full">
    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-1.5 ml-1">{label}</label>
    <input
      {...props}
      className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all rounded-none"
    />
  </div>
);

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
  const isSubmittingRef = useRef(false);

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
    
    // Prevent double-clicking
    if (isSubmittingRef.current || isProcessing) return;
    
    if (!isStockAvailable) {
      toast.error("Some items are out of stock. Please check your bag.");
      return;
    }
    if (!validateForm()) return;

    isSubmittingRef.current = true;
    setIsProcessing(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Check your connection.");
        setIsProcessing(false);
        isSubmittingRef.current = false;
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
        toast.error(orderResponse.message || "Failed to create order.", { id: "payment-toast" });
        setIsProcessing(false);
        isSubmittingRef.current = false;
        return;
      }

      const { order: rzpOrder, dbOrderId } = orderResponse;
      toast.dismiss("payment-toast");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
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
              setIsProcessing(false); 
              isSubmittingRef.current = false;
              
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
              setIsProcessing(false);
              isSubmittingRef.current = false;
            }
          } catch (err) {
            console.error(err);
            toast.error("Server error during verification.", { id: "verify-toast" });
            setIsProcessing(false);
            isSubmittingRef.current = false;
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
        modal: {
          ondismiss: async function () {
            setIsProcessing(false); 
            isSubmittingRef.current = false;
            toast.error("Payment cancelled by user.");
            
            //  Permanent Delete uncompleted ghost order in DB
            try {
              if (dbOrderId) await deleteOrderApi(dbOrderId);
            } catch (cleanupErr) {
              console.error("Cleanup failed:", cleanupErr);
            }
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', async function (response) {
        console.error("Payment Failed", response.error);
        toast.error("Payment Failed: " + response.error.description);
        setIsProcessing(false); 
        isSubmittingRef.current = false;
        
        //Permanent Delete uncompleted ghost order in DB
        try {
          if (dbOrderId) await deleteOrderApi(dbOrderId);
        } catch (cleanupErr) {
          console.error("Cleanup failed:", cleanupErr);
        }
      });

      razorpayInstance.open();

    } catch (error) {
      console.error(error);
      toast.error("Payment gateway error.", { id: "payment-toast" });
      setIsProcessing(false);
      isSubmittingRef.current = false;
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f6f4] flex flex-col items-center justify-center">
        <p className="text-stone-400 text-[11px] uppercase tracking-[0.5em] font-bold mb-6">No assets to checkout</p>
        <button onClick={() => navigate("/")} className="bg-stone-900 text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-none">Return to Archive</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-stone-900 font-sans selection:bg-[#ccff00] selection:text-stone-900 pt-[120px] lg:pt-[140px] pb-24">
      <Toaster position="top-right" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-10 lg:mb-12">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors mb-6 w-fit"
          >
            <ChevronLeft size={14} strokeWidth={2.5} /> Go Back
          </button>
          
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic mb-4">Secure Checkout</h1>
          <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-stone-400">
            <span className="cursor-pointer hover:text-stone-900 transition-colors" onClick={() => navigate("/bag")}>Bag</span> 
            <ChevronRight size={10} />
            <span className="text-stone-900">Information & Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          <div className="w-full lg:w-[55%]">
            <form id="checkout-form" onSubmit={handlePayment} className="bg-white border border-stone-200 p-6 md:p-10 shadow-sm space-y-12">
              
              <div>
                <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-4">
                  <div className="bg-[#ccff00] text-stone-900 w-7 h-7 rounded-none flex items-center justify-center text-[10px] font-black shadow-sm">1</div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Contact Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <InputField label="First Name" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="E.g. Jack" />
                  <InputField label="Last Name" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="E.g. Ali" />
                  <div className="md:col-span-2">
                    <InputField label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@domain.com" />
                  </div>
                  <div className="md:col-span-2">
                    <InputField label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10-digit mobile number" maxLength="10" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-4">
                  <div className="bg-[#ccff00] text-stone-900 w-7 h-7 rounded-none flex items-center justify-center text-[10px] font-black shadow-sm">2</div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="md:col-span-2">
                    <InputField label="Street Address / Flat No." type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House number and street name" />
                  </div>
                  <InputField label="City" type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="E.g. Mumbai" />
                  <InputField label="State" type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="E.g. Maharashtra" />
                  <div className="md:col-span-2">
                    <InputField label="PIN Code" type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="6-digit postal code" maxLength="6" />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-[45%]">
            <div className="bg-white border border-stone-200 rounded-none p-6 md:p-8 shadow-sm sticky top-28">
              <h2 className="text-sm font-black uppercase tracking-widest text-stone-900 mb-6 border-b border-stone-100 pb-4 flex items-center gap-2">
                Order Summary {isBuyNow && <span className="text-[#a3cc00] tracking-normal text-[10px] bg-[#a3cc00]/10 px-2 py-1">(Direct Buy)</span>}
              </h2>
              
              <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {checkoutItems.map((item, idx) => {
                  const product = item.product || {};
                  const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;
                  const variantsList = Array.isArray(product?.variants) ? product.variants : (product?.variants ? [product.variants] : []);
                  const variant = variantsList.find((v) => v._id?.toString() === variantId?.toString()) || item.variant || {};
                  
                  const displayImage = variant?.images?.[0]?.url || product?.images?.[0]?.url;
                  const price = variant?.price?.amount || product?.price?.amount || 0;

                  return (
                    <div key={idx} className="flex gap-4 items-center p-3 border border-stone-100 rounded-none bg-stone-50/50 hover:bg-stone-50 transition-colors">
                      <div className="w-16 h-20 bg-stone-100 rounded-none overflow-hidden shrink-0 border border-stone-200">
                        <img src={displayImage} alt="product" className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[11px] font-black uppercase tracking-tight text-stone-900 line-clamp-1 mb-1">{variant.title || product.title}</h3>
                        <div className="flex items-center flex-wrap gap-2 text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-2">
                          <span className="bg-stone-200 px-1.5 py-0.5 text-stone-700">Qty: {item.quantity}</span>
                          {Object.values(variant.attributes || {}).map((val, i) => (
                            <span key={i}>• {val}</span>
                          ))}
                        </div>
                        <span className="text-xs font-black text-stone-900">{currency} {price * item.quantity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-6 border-t border-stone-100 mb-6">
                <div className="flex justify-between text-[11px] font-black text-stone-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-stone-900">{currency} {subtotal}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black text-stone-500 uppercase tracking-widest">
                  <span>Shipping</span>
                  {shipping === 0 ? <span className="text-[#a3cc00] border border-[#a3cc00] px-2 py-0.5">FREE</span> : <span className="text-stone-900">{currency} {shipping}</span>}
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
                className={`w-full py-4.5 rounded-none text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)]
                  ${isProcessing || !isStockAvailable 
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed shadow-none" 
                    : "bg-[#ccff00] text-stone-900 hover:bg-[#bbf000] hover:shadow-[0_6px_20px_rgba(204,255,0,0.4)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]"}`}
              >
                {isProcessing ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                       <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                       <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                     </svg>
                     Processing...
                   </span>
                ) : (
                  <>
                    <CreditCard size={16} fill="currentColor" className="text-stone-900" />
                    Pay {currency} {totalAmount}
                  </>
                )}
              </button>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-stone-400 border-t border-stone-100 pt-6">
                <div className="flex items-center gap-1.5"><ShieldCheck size={14} /><span className="text-[8px] font-black uppercase tracking-widest">256-bit Secure</span></div>
                <div className="w-px h-3 bg-stone-200 hidden sm:block"></div>
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