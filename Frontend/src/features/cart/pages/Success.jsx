import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Package, MapPin, CreditCard, ArrowRight } from "lucide-react";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  // Security check: Agar koi direct /success url dale bina payment ke, usko wapas bhej do
  useEffect(() => {
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  return (
    <div className="min-h-screen bg-[#f7f6f4] flex flex-col items-center pt-[130px] pb-24 px-6">
      
      {/* Animated Success Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="w-20 h-20 bg-[#ccff00] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(204,255,0,0.4)]">
          <CheckCircle2 size={40} className="text-stone-900" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic text-stone-900 mb-2">
          Payment Secured
        </h1>
        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
          Order ID: <span className="text-stone-900">{orderData.orderId}</span>
        </p>
      </div>

      {/* Main Receipt Container */}
      <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-3xl p-8 lg:p-12 shadow-sm">
        
        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-10 border-b border-stone-100">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-400 mb-2">
              <MapPin size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Shipping To</span>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl text-xs font-medium text-stone-600 leading-relaxed border border-stone-100">
              <p className="font-bold text-stone-900 text-sm mb-1">{orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}</p>
              <p>{orderData.shippingAddress.address}</p>
              <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.pincode}</p>
              <p className="mt-2 text-stone-400">{orderData.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-400 mb-2">
              <CreditCard size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Payment Summary</span>
            </div>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-stone-500 font-medium">Status</span>
                <span className="bg-[#ccff00]/20 text-[#8cb300] text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">Paid</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-stone-500 font-medium">Transaction ID</span>
                <span className="text-xs text-stone-900 font-bold truncate max-w-[120px]">{orderData.transactionId}</span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Amount Paid</span>
                <span className="text-2xl font-black text-stone-900">{orderData.currency} {orderData.totalAmount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Items List */}
        <div>
          <div className="flex items-center gap-2 text-stone-400 mb-6">
            <Package size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Secured Assets</span>
          </div>
          
          <div className="space-y-4">
            {orderData.items.map((item, idx) => {
              const product = item.product || {};
              const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;
              const variantsList = Array.isArray(product?.variants) ? product.variants : (product?.variants ? [product.variants] : []);
              const variant = variantsList.find((v) => v._id?.toString() === variantId?.toString()) || item.variant || {};
              const displayImage = variant?.images?.[0]?.url || product?.images?.[0]?.url;

              return (
                <div key={idx} className="flex gap-4 items-center p-3 hover:bg-stone-50 rounded-xl transition-colors">
                  <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                    <img src={displayImage} alt="item" className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black uppercase tracking-tight text-stone-900 mb-1">{variant.title || product.title}</h3>
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      <span>Qty: {item.quantity}</span>
                      {Object.values(variant.attributes || {}).map((val, i) => (
                        <span key={i} className="ml-2">• {val}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link 
          to="/" 
          className="flex-1 bg-stone-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link 
          to="/profile" 
          className="flex-1 bg-white text-stone-900 border border-stone-200 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
        >
          View Orders <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  );
};

export default Success;