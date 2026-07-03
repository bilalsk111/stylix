import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../auth/hook/useAuth";
import { useOrder } from "../../order/hook/UseOrder";
import { useNavigate, Link } from "react-router-dom"; // Link imported for product cards
import { getWishlistApi } from "../../wishlist/services/wishlist.api"; // API import (path verify kar lena)
import { useWishlist } from "../../wishlist/hook/useWishList"; // Hook import for removal logic
import {
    User, Mail, Phone, Package, LayoutGrid, LogOut,
    ArrowRight, Clock, ShieldCheck, Heart, MapPin, LifeBuoy, AlertTriangle,
    ChevronLeft, Trash2
} from "lucide-react"; // Removed Settings, added Trash2
import { logoutApi } from "../../auth/services/auth.api";
import toast from "react-hot-toast";

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const { buyerOrders, isLoading, handleFetchMyOrders, handleCancelMyOrder } = useOrder();
    const { handleToggleWishlist } = useWishlist(); // Global wishlist toggle
    const navigate = useNavigate();

    // UI States
    const [activeTab, setActiveTab] = useState("orders");
    const [cancelModalOpen, setCancelModalOpen] = useState(null);

    // Wishlist Local States
    const [wishlistData, setWishlistData] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const isSeller = currentUser?.role === "seller";

    // 1. Fetch Orders
    useEffect(() => {
        if (!isSeller) {
            handleFetchMyOrders();
        }
    }, [isSeller]);

    // 2. Fetch Wishlist ONLY when tab is active
    useEffect(() => {
        if (activeTab === "wishlist") {
            const fetchDetailedWishlist = async () => {
                try {
                    setLoadingWishlist(true);
                    const data = await getWishlistApi();
                    if (data.success) {
                        setWishlistData(data.wishlist);
                    }
                } catch (error) {
                    console.error("Failed to load wishlist details in profile", error);
                } finally {
                    setLoadingWishlist(false);
                }
            };
            fetchDetailedWishlist();
        }
    }, [activeTab]);

    const handleRemoveWishlistItem = (e, productId) => {
        handleToggleWishlist(e, productId); // Global update
        setWishlistData((prev) => prev.filter((item) => item._id !== productId)); // Local instant UI update
    };

    const safeOrders = Array.isArray(buyerOrders) ? buyerOrders : [];
    const activeOrders = useMemo(() => {
        return safeOrders.filter(
            order => order.orderStatus === "Processing" || order.orderStatus === "Shipped"
        );
    }, [safeOrders]);

    const hasActiveOrders = activeOrders.length > 0;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutApi();
            toast.success("Logged out successfully.", {
                style: { background: '#000000', color: '#ccff00', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
                duration: 2000
            });
            setShowLogoutModal(false); // Close modal on success
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed. Please try again.", {
                style: { background: '#000000', color: '#ff4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
                duration: 2000
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const confirmCancellation = () => {
        if (cancelModalOpen) {
            handleCancelMyOrder(cancelModalOpen);
            setCancelModalOpen(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f6f4] text-stone-900 pt-[120px] pb-24 px-6 lg:px-12 font-sans relative">
            <div className="max-w-[1200px] mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-all group py-6"
                >
                    <div className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center group-hover:border-stone-900 group-hover:bg-stone-100 transition-colors">
                        <ChevronLeft size={14} strokeWidth={2.5} />
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

                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm"
                        >
                            <LogOut size={14} /> Log Out
                        </button>
                    </div>
                </div>

                {/* ── ROLE BASED RENDERING ── */}
                {isSeller ? (
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
                    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up">
                        {/* LEFT SIDEBAR */}
                        <div className="w-full lg:w-[30%] space-y-6">
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
                                    </button>
                                </div>
                            </div>

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

                        {/* RIGHT CONTENT */}
                        <div className="w-full lg:w-[70%] bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-sm">

                            {/* ── ORDERS TAB ── */}
                            {activeTab === "orders" && (
                                <>
                                    <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Clock size={18} className="text-stone-900" />
                                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Active Deliveries</h2>
                                        </div>
                                        <button
                                            onClick={() => navigate('/order-history')}
                                            className="text-[10px] font-black text-stone-500 uppercase tracking-widest hover:text-stone-900 underline underline-offset-4 transition-colors"
                                        >
                                            View All History <ArrowRight size={12} className="inline mb-0.5" />
                                        </button>
                                    </div>

                                    {isLoading && !hasActiveOrders ? (
                                        <div className="py-16 text-center text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 animate-pulse">
                                            Tracking Assets...
                                        </div>
                                    ) : !hasActiveOrders ? (
                                        <div className="py-20 text-center">
                                            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-stone-200">
                                                <Package size={28} className="text-stone-300" />
                                            </div>
                                            <p className="text-stone-400 text-[11px] uppercase tracking-[0.3em] font-black mb-6">No active deliveries</p>
                                            <button
                                                onClick={() => navigate("/order-history")}
                                                className="bg-stone-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-stone-900 transition-all shadow-md hover:shadow-lg"
                                            >
                                                Past Records
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {activeOrders.map((order, index) => (
                                                <div key={order._id || index} className="border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-colors">
                                                    <div className="bg-stone-50 p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">
                                                                Order #{order._id ? order._id.slice(-8).toUpperCase() : "PENDING"}
                                                            </span>
                                                            <span className="text-xs font-bold text-stone-900">
                                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : "Processing Date"}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-stretch gap-2 sm:gap-3">
                                                            <div className="flex flex-col justify-center px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm">
                                                                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-stone-400 mb-0.5">Net Value</span>
                                                                <span className="text-sm font-black text-stone-900 leading-none">₹{order.totalAmount || 0}</span>
                                                            </div>

                                                            <div className="flex flex-col justify-center px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm">
                                                                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Live Status</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    {order.orderStatus === "Processing" && (
                                                                        <span className="relative flex h-1.5 w-1.5">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none text-stone-900">
                                                                        {order.orderStatus || "Pending"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {order.orderStatus === "Processing" && (
                                                                <button
                                                                    onClick={() => setCancelModalOpen(order._id)}
                                                                    className="flex flex-col justify-center px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm hover:border-red-500 hover:bg-red-50 group transition-all cursor-pointer"
                                                                >
                                                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-red-400 transition-colors mb-0.5">Action</span>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none text-stone-400 group-hover:text-red-600 transition-colors">
                                                                        Cancel
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="p-5 space-y-5 bg-white">
                                                        {(!order.items || order.items.length === 0) ? (
                                                            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Processing items data...</div>
                                                        ) : (
                                                            order.items.map((item, idx) => (
                                                                <div key={idx} className="flex gap-5 items-center">
                                                                    <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden border border-stone-100 shrink-0">
                                                                        <img src={item.product?.images?.[0]?.url || "https://via.placeholder.com/150"} alt="product" className="w-full h-full object-cover mix-blend-multiply" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h3 className="text-xs font-black uppercase tracking-tight text-stone-900 mb-1">{item.product?.title || "Secured Asset"}</h3>
                                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Qty: {item.quantity || 1}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-xs font-black text-stone-900">₹{item.price?.amount || item.product?.price?.amount || 0}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ── WISHLIST TAB ── */}
                            {activeTab === "wishlist" && (
                                <>
                                    <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <Heart size={18} className="text-stone-900" />
                                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Your Archive</h2>
                                        </div>
                                    </div>

                                    {loadingWishlist ? (
                                        <div className="py-16 text-center text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 animate-pulse">
                                            Loading Archive...
                                        </div>
                                    ) : wishlistData.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-stone-200">
                                                <Heart size={28} className="text-stone-300" />
                                            </div>
                                            <p className="text-stone-400 text-[11px] uppercase tracking-[0.3em] font-black mb-6">Archive is Empty</p>
                                            <button
                                                onClick={() => navigate("/shop")}
                                                className="bg-stone-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-stone-900 transition-all shadow-md hover:shadow-lg"
                                            >
                                                Explore Assets
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                                            {wishlistData.map(item => (
                                                <div key={item._id} className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm flex flex-col">

                                                    <button
                                                        onClick={(e) => handleRemoveWishlistItem(e, item._id)}
                                                        className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full text-stone-400 hover:text-red-500 hover:border-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Remove from Archive"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>

                                                    <Link to={`/product/${item._id}`} className="aspect-[3/4] overflow-hidden bg-stone-100">
                                                        <img
                                                            src={item.images?.[0]?.url || "fallback-image-url-here"}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-[2s]"
                                                        />
                                                    </Link>

                                                    <div className="p-4 flex flex-col flex-1">
                                                        <Link to={`/product/${item._id}`}>
                                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-900 truncate mb-1">
                                                                {item.title}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-stone-500 text-[9px] font-bold mt-auto pt-2">
                                                            {item.price?.currency} {item.price?.amount}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── CANCEL MODAL ── */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-stone-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-stone-900 mb-2">Abort Transaction?</h3>
                            <p className="text-xs font-medium text-stone-500 leading-relaxed">
                                Are you sure you want to permanently cancel this order? This action cannot be reversed and your asset will be released back into inventory.
                            </p>
                        </div>
                        <div className="flex border-t border-stone-100">
                            <button
                                onClick={() => setCancelModalOpen(null)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-colors border-r border-stone-100"
                            >
                                Nevermind
                            </button>
                            <button
                                onClick={confirmCancellation}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div
                        className="bg-white border border-stone-200 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-5 transform scale-100 transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="space-y-1">
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-stone-900">
                                Confirm Logout
                            </h3>
                            <p className="text-[10px] text-stone-500 italic leading-relaxed font-medium">
                                Are you sure you want to exit your account? You will need to log back in to access your seller dashboard.
                            </p>
                        </div>

                        {/* Divider line matches your product ref divider */}
                        <div className="border-t border-stone-100" />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                disabled={isLoggingOut}
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest border border-stone-200 bg-white rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={isLoggingOut}
                                onClick={handleLogout}
                                className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest bg-stone-900 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
                            >
                                {isLoggingOut ? (
                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <LogOut size={12} />
                                )}
                                {isLoggingOut ? "Logging Out..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;