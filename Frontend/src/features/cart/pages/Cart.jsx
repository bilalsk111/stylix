import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Minus,
    Plus,
    X,
    ArrowRight,
    ShieldCheck,
    Lock,
    ArrowLeft,
    ShoppingBag,
    Ticket,
    RefreshCcw,
    AlertCircle
} from "lucide-react";
import { useCart } from "../hook/useCart";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import toast from "react-hot-toast";

const Cart = () => {
    const navigate = useNavigate();
     const user = useSelector((state) => state.auth);
    const { error, isLoading, Razorpay } = useRazorpay();
    const { handleGetCart, handleUpdateItemQty, handleRemoveItem, handleCreateOrder } = useCart();
    const EMPTY_CART = []; // 🔥 Naya constant banaya
    const cartItems = useSelector((state) => state.cart?.items || EMPTY_CART);
    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState("");





    useEffect(() => {
        let isMounted = true;
        const fetchCart = async () => {
            try {
                setLoading(true);
                await handleGetCart();
            } catch (error) {
                console.error("Failed to load cart", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchCart();
        return () => {
            isMounted = false;
        };
    }, []);

    const subtotal = cartItems.reduce((acc, item) => {
        const product = item.product || {};
        const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;

        // 🔥 FIX 2: Bulletproof Variant Check (Handles both Array and Object from DB)
        const variantsList = Array.isArray(product?.variants)
            ? product.variants
            : (product?.variants ? [product.variants] : []);

        const variant = variantsList.find((v) => v._id?.toString() === variantId?.toString()) || item.variant || {};

        const price = variant?.price?.amount || product?.price?.amount || 0;
        return acc + price * item.quantity;
    }, 0);

    const currency = cartItems[0]?.product?.price?.currency || "INR";

    const shippingThreshold = 2000;
    const amountForFreeShipping = Math.max(0, shippingThreshold - subtotal);
    const progressPercentage = Math.min(100, (subtotal / shippingThreshold) * 100);

    const shipping = subtotal >= shippingThreshold ? 0 : 150;
    const total = subtotal + shipping;

    const updateQuantity = async ({ productId, variantId, quantity }) => {
        if (quantity < 1) return;
        try {
            await handleUpdateItemQty({ productId, variantId, quantity });
        } catch (e) {
            console.error("Failed to update qty", e);
        }
    };

    const removeItem = async ({ productId, variantId }) => {
        try {
            await handleRemoveItem({ productId, variantId });
        } catch (e) {
            console.error("Failed to remove item", e);
        }
    };
   const handleCheckout = () => {
    // Agar cart khali hai toh rok do
    if (!cartItems || cartItems.length === 0) {
        toast.error("Your cart is empty!");
        return;
    }
    
    // User ko Checkout page par bhej do jahan form aur payment logic likha hai
    navigate("/checkout");
};

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f6f4] flex items-center justify-center">
                <div className="text-stone-900 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
                    Retrieving Stylix Assets...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f6f4] text-stone-900 font-sans selection:bg-stone-900 selection:text-[#c8ff00] pt-[100px] lg:pt-[130px] pb-24">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-10 border-b border-stone-200 pb-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic">
                            Your Bag
                        </h1>
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                            {cartItems.length} {cartItems.length === 1 ? "Asset" : "Assets"} Secured
                        </p>
                    </div>
                    <Link
                        to="/"
                        className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
                    >
                        <ArrowLeft size={14} /> Continue Shopping
                    </Link>
                </div>

                {cartItems.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-24 bg-white border border-stone-200 rounded-2xl shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,255,0,0.05)_0,transparent_50%)] pointer-events-none"></div>
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-100 shadow-inner relative z-10">
                            <ShoppingBag size={32} className="text-stone-300" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-stone-900 mb-2 relative z-10">
                            Your vault is empty
                        </h2>
                        <p className="text-stone-400 text-[11px] font-medium tracking-wide mb-8 relative z-10">
                            Secure limited drop items before they vanish.
                        </p>
                        <Link
                            to="/"
                            className="bg-stone-900 text-white px-8 py-4 rounded-md text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#c8ff00] hover:text-stone-900 transition-all duration-300 shadow-md relative z-10"
                        >
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

                        {/* LEFT COLUMN: CART ITEMS */}
                        <div className="w-full lg:w-[65%] flex flex-col gap-4">

                            {/* FREE SHIPPING TRACKER */}
                            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm mb-2">
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900">
                                        {amountForFreeShipping > 0
                                            ? `Add ${currency} ${amountForFreeShipping} for Free Shipping`
                                            : "You unlocked Free Shipping!"}
                                    </h3>
                                    <span className="text-stone-400 text-[9px] font-bold tracking-wider">
                                        {currency} {shippingThreshold}
                                    </span>
                                </div>
                                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#c8ff00] transition-all duration-700 ease-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* CART ITEMS MAP */}
                            {cartItems.map((item, index) => {
                                const product = item.product || {};
                                const safeProductId = typeof product === "object" ? product._id : product;
                                const safeVariantId = typeof item.variant === "object" ? item.variant?._id : item.variant;

                                // 🔥 FIX 2 AGAIN: Bulletproof map logic
                                const variantsList = Array.isArray(product?.variants)
                                    ? product.variants
                                    : (product?.variants ? [product.variants] : []);

                                const variant = variantsList.find((v) => v._id?.toString() === safeVariantId?.toString()) || item.variant || {};

                                const displayImage = variant?.images?.length > 0 && variant.images[0]?.url
                                    ? variant.images[0].url
                                    : product?.images?.[0]?.url || "https://via.placeholder.com/150";

                                const displayTitle = variant?.title && variant.title.toUpperCase() !== "DEFAULT"
                                    ? variant.title
                                    : product?.title;

                                const mainPrice = product?.price?.amount || 0;
                                const variantPrice = variant?.price?.amount || mainPrice;
                                const hasDiscount = mainPrice > variantPrice;
                                const savedAmount = mainPrice - variantPrice;

                                const availableStock = variant?.stock || 0;
                                const isLowStock = availableStock > 0 && availableStock <= 5;
                                const isOutOfStock = availableStock === 0;
                                const hasReachedMaxStock = item.quantity >= availableStock;

                                return (
                                    <div
                                        key={item._id || index}
                                        className="flex gap-4 sm:gap-5 bg-white p-3.5 sm:p-5 border border-stone-200 rounded-2xl shadow-sm hover:border-stone-400 transition-colors duration-300 relative group"
                                    >
                                        <div className="w-20 sm:w-28 aspect-[3/4] bg-stone-50 rounded-xl overflow-hidden shrink-0 border border-stone-100 relative">
                                            <img
                                                src={displayImage}
                                                alt={displayTitle}
                                                className={`w-full h-full object-cover mix-blend-multiply transform group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? "grayscale opacity-40" : ""}`}
                                            />
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                                                    <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-sm shadow-md">
                                                        Sold Out
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col flex-1 py-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-black uppercase tracking-tighter text-stone-900 leading-tight mb-2">
                                                        {displayTitle}
                                                    </h3>

                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {Object.entries(variant?.attributes || {}).map(
                                                            ([key, val]) => (
                                                                <span
                                                                    key={key}
                                                                    className="text-[9px] text-stone-500 font-bold uppercase tracking-widest bg-stone-50 px-1.5 py-1 border border-stone-200 rounded"
                                                                >
                                                                    {key}: <span className="text-stone-900">{val}</span>
                                                                </span>
                                                            ),
                                                        )}

                                                        {!isOutOfStock && (
                                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-1 rounded border ${isLowStock
                                                                ? 'text-orange-600 bg-orange-50 border-orange-100 animate-pulse'
                                                                : 'text-stone-500 bg-stone-50 border-stone-200'
                                                                }`}>
                                                                {availableStock} In Stock
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right flex flex-col items-end gap-0.5 shrink-0">
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-[10px] text-stone-400 font-bold line-through italic">
                                                                {currency} {mainPrice}
                                                            </span>
                                                            <p className="text-base font-black text-stone-900 leading-none">
                                                                {currency} {variantPrice}
                                                            </p>
                                                            <span className="text-[#84cc16] text-[9px] font-black uppercase tracking-widest bg-[#84cc16]/10 px-1.5 py-0.5 rounded-sm mt-1">
                                                                Save {currency} {savedAmount}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <p className="text-base font-black text-stone-900 leading-none">
                                                            {currency} {variantPrice}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between mt-auto pt-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className={`flex items-center p-0.5 rounded-lg border ${isOutOfStock ? "bg-stone-50 border-stone-100 opacity-50" : "bg-stone-50 border-stone-200 shadow-sm"}`}>
                                                        <button
                                                            disabled={isOutOfStock}
                                                            onClick={() =>
                                                                updateQuantity({
                                                                    productId: safeProductId,
                                                                    variantId: safeVariantId,
                                                                    quantity: item.quantity - 1,
                                                                })
                                                            }
                                                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md text-stone-500 hover:text-stone-900 hover:shadow-sm transition-all disabled:cursor-not-allowed"
                                                        >
                                                            <Minus size={12} strokeWidth={2.5} />
                                                        </button>

                                                        <span className="w-8 text-center text-xs font-black text-stone-900">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            disabled={isOutOfStock || hasReachedMaxStock}
                                                            onClick={() =>
                                                                updateQuantity({
                                                                    productId: safeProductId,
                                                                    variantId: safeVariantId,
                                                                    quantity: item.quantity + 1,
                                                                })
                                                            }
                                                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${isOutOfStock || hasReachedMaxStock
                                                                ? "text-stone-300 cursor-not-allowed"
                                                                : "bg-white text-stone-500 hover:text-stone-900 hover:shadow-sm"
                                                                }`}
                                                        >
                                                            <Plus size={12} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                    {hasReachedMaxStock && !isOutOfStock && (
                                                        <span className="text-[8px] font-bold text-stone-400 tracking-widest uppercase flex items-center gap-1">
                                                            <AlertCircle size={8} /> Max Limit
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        removeItem({
                                                            productId: safeProductId,
                                                            variantId: safeVariantId,
                                                        })
                                                    }
                                                    className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 pb-1"
                                                >
                                                    <X size={12} strokeWidth={3} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* RIGHT COLUMN: ORDER SUMMARY */}
                        <div className="w-full lg:w-[35%]">
                            <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-2xl shadow-sm sticky top-32">
                                <h2 className="text-lg font-black uppercase tracking-tighter mb-6 border-b border-stone-100 pb-4">
                                    Order Summary
                                </h2>

                                <div className="mb-6 pb-6 border-b border-stone-100">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-2 block">
                                        Promo Code
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                placeholder="ENTER CODE"
                                                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 pl-9 pr-3 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-stone-900 transition-colors"
                                            />
                                        </div>
                                        <button className="bg-stone-100 text-stone-900 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-colors">
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3.5 text-sm font-medium text-stone-500 mb-6 border-b border-stone-100 pb-6">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-stone-900 font-bold">
                                            {currency} {subtotal}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Estimated Shipping</span>
                                        {shipping === 0 ? (
                                            <span className="text-[#84cc16] font-black uppercase tracking-widest text-[10px]">
                                                Free
                                            </span>
                                        ) : (
                                            <span className="text-stone-900 font-bold">
                                                {currency} {shipping}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Taxes</span>
                                        <span className="text-stone-400 italic text-[9px] uppercase tracking-widest">
                                            Calculated at checkout
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mb-8">
                                    <span className="text-sm font-black uppercase tracking-widest text-stone-900">
                                        Total
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-black text-stone-900 leading-none">
                                        {currency} {total}
                                    </span>
                                </div>

                                <button
                                   onClick={handleCheckout}
                                    className="w-full bg-stone-900 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#c8ff00] hover:text-stone-900 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-3 group"
                                >
                                    Proceed to Checkout
                                    <ArrowRight
                                        size={16}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </button>

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center justify-center gap-4 text-stone-400 border-b border-stone-100 pb-4">
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck size={14} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Secure</span>
                                        </div>
                                        <span className="w-px h-3 bg-stone-200"></span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock size={14} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">SSL</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-stone-500 pt-1">
                                        <RefreshCcw size={12} />
                                        <p className="text-[9px] font-bold uppercase tracking-widest">
                                            Easy 14-Day Returns on authentic items
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;