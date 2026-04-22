import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Minus, Plus, X, ArrowRight, ShieldCheck,
    Lock, ArrowLeft, ShoppingBag
} from "lucide-react";
import { useCart } from "../hook/useCart";

const Cart = () => {
    const navigate = useNavigate();
    const { handleGetCart, handleUpdateItemQty, handleRemoveItem } = useCart();

    const cartItems = useSelector((state) => state.cart?.items || []);
    const [loading, setLoading] = useState(true);

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
        return () => { isMounted = false; };
    }, []);

    // 💡 FIX 1: Subtotal calculation ab properly actual variant dhundh ke price nikalega
    const subtotal = cartItems.reduce((acc, item) => {
        const product = item.product || {};
        const variantId = typeof item.variant === "object" ? item.variant?._id : item.variant;
        const variant = product?.variants?.find((v) => v._id === variantId) || item.variant || {};

        const price = variant?.price?.amount || product?.price?.amount || 0;
        return acc + (price * item.quantity);
    }, 0);

    const currency = cartItems[0]?.product?.price?.currency || "INR";
    const shipping = subtotal > 2000 ? 0 : 150;
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f6f4] flex items-center justify-center">
                <div className="text-stone-900 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse">
                    Retrieving Vault Assets...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f6f4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white pt-[100px] lg:pt-[130px] pb-24">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-10 border-b border-stone-200 pb-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic">Your Bag</h1>
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                            {cartItems.length} {cartItems.length === 1 ? "Asset" : "Assets"} Secured
                        </p>
                    </div>
                    <Link to="/" className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">
                        <ArrowLeft size={14} /> Continue Shopping
                    </Link>
                </div>

                {cartItems.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-stone-200 rounded-xl shadow-sm">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag size={32} className="text-stone-300" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-stone-900 mb-2">Your bag is empty</h2>
                        <p className="text-stone-400 text-[11px] font-medium tracking-wide mb-8">Secure limited drop items before they vanish.</p>
                        <Link to="/" className="bg-stone-900 text-white px-8 py-4 rounded-md text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#c8ff00] hover:text-stone-900 transition-all shadow-md">
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

                        {/* LEFT COLUMN: CART ITEMS */}
                        <div className="w-full lg:w-[65%] flex flex-col gap-6">
                            {cartItems.map((item, index) => {
                                const product = item.product || {};

                                // 🔥 FIX 1: SAFE IDs NIKALO
                                const safeProductId = typeof product === "object" ? product._id : product;
                                const safeVariantId = typeof item.variant === "object" ? item.variant?._id : item.variant;

                                // Ab safeVariantId use karo variant dhundhne ke liye
                                const variant = product?.variants?.find((v) => v._id === safeVariantId) || item.variant || {};

                                const displayImage = variant?.images?.length > 0 && variant.images[0]?.url
                                    ? variant.images[0].url
                                    : product?.images?.[0]?.url || "https://via.placeholder.com/150";

                                const price = variant?.price?.amount || product?.price?.amount || 0;

                                const displayTitle = variant?.title && variant.title.toUpperCase() !== "DEFAULT"
                                    ? variant.title
                                    : product?.title;

                                return (
                                    <div key={item._id || index} className="flex gap-4 sm:gap-6 bg-white p-4 sm:p-6 border border-stone-200 rounded-xl shadow-sm relative group">

                                        {/* Item Image */}
                                        <div className="w-24 sm:w-32 aspect-[3/4] bg-stone-100 rounded-md overflow-hidden shrink-0 border border-stone-100">
                                            <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover mix-blend-multiply" />
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex flex-col justify-between flex-1 py-1">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tighter text-stone-900 leading-tight">
                                                        {displayTitle}
                                                    </h3>

                                                    {/* Attributes (Size/Color) */}
                                                    <div className="flex flex-wrap gap-3 mt-2">
                                                        {Object.entries(variant?.attributes || {}).map(([key, val]) => (
                                                            <span key={key} className="text-[9px] text-stone-500 font-bold uppercase tracking-widest bg-stone-50 px-2 py-1 border border-stone-200 rounded-sm">
                                                                {key}: <span className="text-stone-900">{val}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="text-sm sm:text-base font-black text-stone-900">
                                                        {currency} {price}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Controls (Qty & Remove) */}
                                            <div className="flex items-center justify-between mt-6">
                                                <div className="flex items-center border border-stone-200 rounded-md overflow-hidden">
                                                    <button
                                                        // 🔥 FIX 2: SAFE IDs PASS KARO
                                                        onClick={() => updateQuantity({
                                                            productId: safeProductId,
                                                            variantId: safeVariantId,
                                                            quantity: item.quantity - 1
                                                        })}
                                                        className="w-8 h-8 flex items-center justify-center bg-stone-50 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 h-8 flex items-center justify-center bg-white text-[11px] font-black">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        // 🔥 FIX 3: SAFE IDs PASS KARO
                                                        onClick={() => updateQuantity({
                                                            productId: safeProductId,
                                                            variantId: safeVariantId,
                                                            quantity: item.quantity + 1
                                                        })}
                                                        className="w-8 h-8 flex items-center justify-center bg-stone-50 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                <button
                                                    // 🔥 FIX 4: SAFE IDs PASS KARO
                                                    onClick={() => removeItem({
                                                        productId: safeProductId,
                                                        variantId: safeVariantId
                                                    })}
                                                    className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                                                >
                                                    <X size={12} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* RIGHT COLUMN: ORDER SUMMARY */}
                        <div className="w-full lg:w-[35%]">
                            <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-xl shadow-sm sticky top-32">
                                <h2 className="text-lg font-black uppercase tracking-tighter mb-6 border-b border-stone-100 pb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-4 text-sm font-medium text-stone-500 mb-6 border-b border-stone-100 pb-6">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-stone-900 font-bold">{currency} {subtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Estimated Shipping</span>
                                        {shipping === 0 ? (
                                            <span className="text-[#84cc16] font-black uppercase tracking-widest text-[10px]">Free</span>
                                        ) : (
                                            <span className="text-stone-900 font-bold">{currency} {shipping}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxes</span>
                                        <span className="text-stone-400 italic text-[10px] uppercase tracking-widest">Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mb-8">
                                    <span className="text-base font-black uppercase tracking-widest text-stone-900">Total</span>
                                    <span className="text-3xl font-black text-stone-900 leading-none">
                                        {currency} {total}
                                    </span>
                                </div>

                                <button
                                    onClick={() => navigate("/checkout")}
                                    className="w-full bg-stone-900 text-white py-5 rounded-md text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#c8ff00] hover:text-stone-900 transition-all shadow-md flex items-center justify-center gap-3 group"
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                {/* Trust Badges */}
                                <div className="mt-6 flex items-center justify-center gap-4 text-stone-400">
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck size={14} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Secure Checkout</span>
                                    </div>
                                    <span className="w-px h-3 bg-stone-200"></span>
                                    <div className="flex items-center gap-1.5">
                                        <Lock size={14} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">SSL Encrypted</span>
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