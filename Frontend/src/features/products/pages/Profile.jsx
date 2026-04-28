import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/hook/useAuth";
import { useOrder } from "../../order/hook/UseOrder";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Phone, Package, LayoutGrid, LogOut,
    ArrowRight, Clock, ShieldCheck, Heart, MapPin, Settings, LifeBuoy,ArrowLeft
} from "lucide-react";

const Profile = () => {
    const { currentUser } = useAuth();
    const { buyerOrders, isLoading, handleFetchMyOrders } = useOrder();
    const navigate = useNavigate();

    // UI State for active tab in buyer profile
    const [activeTab, setActiveTab] = useState("orders");

    const isSeller = currentUser?.role === "seller";

    useEffect(() => {
        if (!isSeller) {
            handleFetchMyOrders();
        }
    }, [isSeller]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "Processing": return "bg-orange-100 text-orange-700";
            case "Shipped": return "bg-blue-100 text-blue-700";
            case "Delivered": return "bg-[#ccff00]/30 text-[#8cb300]";
            case "Cancelled": return "bg-red-100 text-red-700";
            default: return "bg-stone-100 text-stone-500";
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f6f4] text-stone-900 pt-[120px] pb-24 px-6 lg:px-12 font-sans">
            <div className="max-w-[1200px] mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-all group py-6"
                >
                    <div className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center group-hover:border-stone-900 group-hover:bg-stone-100 transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Exit Profile</span>
                </button>
                {/* ── COMMON HEADER: USER DETAILS ── */}
                <div className="bg-white border border-stone-200 rounded-2xl p-8 lg:p-10 shadow-sm mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 rounded-bl-full -z-10"></div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-stone-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black uppercase shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                                {currentUser?.fullname?.charAt(0) || "U"}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-3xl font-black uppercase tracking-tighter italic text-stone-900">
                                        {currentUser?.fullname}
                                    </h1>
                                    {isSeller ? (
                                        <span className="bg-[#ccff00]/20 text-[#8cb300] flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                                            <ShieldCheck size={10} /> Merchant
                                        </span>
                                    ) : (
                                        <span className="bg-stone-100 text-stone-500 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                                            Elite Member
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-stone-500 text-[11px] font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Mail size={12} /> {currentUser?.email}</span>
                                    <span className="flex items-center gap-1.5"><Phone size={12} /> {currentUser?.contact || "No contact added"}</span>
                                </div>
                            </div>
                        </div>

                        <button className="flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm">
                            <LogOut size={14} /> Log Out
                        </button>
                    </div>
                </div>

                {/* ── ROLE BASED RENDERING ── */}
                {isSeller ? (

                    /* === SELLER CONTROL PANEL === */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                        <div
                            onClick={() => navigate("/seller/dashboard")}
                            className="bg-white border border-stone-200 p-8 rounded-2xl cursor-pointer hover:border-stone-900 transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#ccff00] transition-colors">
                                <LayoutGrid size={20} className="text-stone-900" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-stone-900 mb-2">Inventory Detail</h2>
                            <p className="text-xs text-stone-500 font-medium mb-6">Manage your product catalog, update stock, and register new assets.</p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-900 group-hover:translate-x-2 transition-transform">
                                Access Vault <ArrowRight size={14} />
                            </div>
                        </div>

                        <div
                            onClick={() => navigate("/seller/orders")}
                            className="bg-white border border-stone-200 p-8 rounded-2xl cursor-pointer hover:border-stone-900 transition-all group shadow-sm hover:shadow-md"
                        >
                            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#ccff00] transition-colors">
                                <Package size={20} className="text-stone-900" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-stone-900 mb-2">Order Detail</h2>
                            <p className="text-xs text-stone-500 font-medium mb-6">Track customer purchases, update fulfillment status, and manage logistics.</p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-900 group-hover:translate-x-2 transition-transform">
                                Open Command Center <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>

                ) : (

                    /* === BUYER PORTAL (UPGRADED LAYOUT) === */
                    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up">

                        {/* LEFT SIDEBAR: Navigation & Support */}
                        <div className="w-full lg:w-[30%] space-y-6">

                            {/* Navigation Card */}
                            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 mb-4 border-b border-stone-100 pb-2">Account Hub</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setActiveTab("orders")}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "orders" ? "bg-stone-900 text-[#ccff00]" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"}`}
                                    >
                                        <Package size={16} /> Order History
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("wishlist")}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "wishlist" ? "bg-stone-900 text-[#ccff00]" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"}`}
                                    >
                                        <div className="flex items-center gap-3"><Heart size={16} /> Wishlist</div>
                                        <span className="bg-stone-200 text-stone-500 text-[8px] px-1.5 py-0.5 rounded font-bold">SOON</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("settings")}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "settings" ? "bg-stone-900 text-[#ccff00]" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"}`}
                                    >
                                        <div className="flex items-center gap-3"><Settings size={16} /> Profile Settings</div>
                                        <span className="bg-stone-200 text-stone-500 text-[8px] px-1.5 py-0.5 rounded font-bold">SOON</span>
                                    </button>
                                </div>
                            </div>

                            {/* VIP Support Card */}
                            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
                                <LifeBuoy size={28} className="text-[#ccff00] mb-5 relative z-10" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 relative z-10">Priority Support</h3>
                                <p className="text-[10px] text-stone-400 font-medium leading-relaxed mb-6 relative z-10">
                                    Need help with an order? Terminal Elite members get 24/7 direct access to our logistics team.
                                </p>
                                <button className="w-full bg-[#ccff00] text-stone-900 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl hover:bg-white transition-colors relative z-10">
                                    Contact Agent
                                </button>
                            </div>

                        </div>

                        {/* RIGHT CONTENT: Order History Feed */}
                        <div className="w-full lg:w-[70%] bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-sm">

                            {activeTab === "orders" && (
                                <>
                                    <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-stone-900" />
                                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Your Deliveries</h2>
                                        </div>
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{buyerOrders?.length || 0} Records</span>
                                    </div>

                                    {isLoading && buyerOrders?.length === 0 ? (
                                        <div className="py-16 text-center text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 animate-pulse">
                                            Decrypting Ledger...
                                        </div>
                                    ) : buyerOrders?.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-stone-200">
                                                <Package size={28} className="text-stone-300" />
                                            </div>
                                            <p className="text-stone-400 text-[11px] uppercase tracking-[0.3em] font-black mb-6">No secured assets yet</p>
                                            <button
                                                onClick={() => navigate("/")}
                                                className="bg-stone-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-stone-900 transition-all shadow-md hover:shadow-lg"
                                            >
                                                Explore Collection
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {buyerOrders?.map((order) => (
                                                <div key={order._id} className="border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-colors">

                                                    {/* Order Header */}
                                                    <div className="bg-stone-50 p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Order #{order._id.slice(-8).toUpperCase()}</span>
                                                            <span className="text-xs font-bold text-stone-900">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-5">
                                                            <div className="text-right">
                                                                <span className="block text-[8px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Total Value</span>
                                                                <span className="text-sm font-black text-stone-900">₹{order.totalAmount}</span>
                                                            </div>
                                                            <div className="h-8 w-px bg-stone-200 hidden sm:block"></div>
                                                            <span className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.orderStatus)}`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="p-5 space-y-5 bg-white">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex gap-5 items-center">
                                                                <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden border border-stone-100 shrink-0">
                                                                    <img src={item.product?.images?.[0]?.url || "https://via.placeholder.com/150"} alt="product" className="w-full h-full object-cover mix-blend-multiply" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-xs font-black uppercase tracking-tight text-stone-900 mb-1">{item.product?.title || "Secured Asset"}</h3>
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Qty: {item.quantity}</p>
                                                                    <button className="text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1">
                                                                        Write Review <ArrowRight size={10} />
                                                                    </button>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-xs font-black text-stone-900">₹{item.product?.price?.amount || 0}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* PLACEHOLDERS FOR OTHER TABS */}
                            {activeTab !== "orders" && (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <div className="text-stone-200 mb-4">
                                        {activeTab === "wishlist" && <Heart size={48} />}
                                        {activeTab === "address" && <MapPin size={48} />}
                                        {activeTab === "settings" && <Settings size={48} />}
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900 mb-2">
                                        {activeTab} Module
                                    </h2>
                                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                                        This sector is currently under construction.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;