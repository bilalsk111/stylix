import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    User, Mail, Phone, Package, LayoutGrid, LogOut,
    ArrowRight, Clock, ShieldCheck, Heart, LifeBuoy, AlertTriangle,
    ChevronLeft, Trash2, Settings
} from "lucide-react";

import { useAuth } from "../../auth/hook/useAuth";
import { useOrder } from "../../order/hook/UseOrder";
import { getWishlistApi } from "../../wishlist/services/wishlist.api";
import { useWishlist } from "../../wishlist/hook/useWishList";
import { updateProfile } from "../../auth/state/auth.slice";

const successToastStyle = {
    style: { background: "#000000", color: "#ccff00", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" },
    duration: 2000,
};
const errorToastStyle = {
    style: { background: "#000000", color: "#ff4444", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" },
    duration: 2000,
};

const BUYER_TABS = [
    { id: "orders", icon: Package, label: "Order History" },
    { id: "wishlist", icon: Heart, label: "Wishlist" },
    { id: "settings", icon: Settings, label: "Settings" },
];

const Profile = () => {
    const { buyerOrders, isLoading, handleFetchMyOrders, handleCancelMyOrder } = useOrder();
    const { handleToggleWishlist } = useWishlist();
    const { handleLogout: authLogout } = useAuth(); // real logout logic lives in the hook
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { loading: updateLoading, user: currentUser } = useSelector((state) => state.auth);
    const isSeller = currentUser?.role === "seller";

    // App State
    const [activeTab, setActiveTab] = useState(isSeller ? "dashboard" : "orders");
    const [cancelModalOpen, setCancelModalOpen] = useState(null);
    const [wishlistData, setWishlistData] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Profile Form State
    const [formData, setFormData] = useState({
        fullname: "",
        contact: "",
        currentPassword: "",
        newPassword: "",
    });

    // Sync form with current user
    useEffect(() => {
        if (currentUser) {
            setFormData((prev) => ({
                ...prev,
                fullname: currentUser.fullname || "",
                contact: currentUser.contact || "",
            }));
        }
    }, [currentUser]);
    useEffect(() => {
        if (!isSeller) handleFetchMyOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSeller]);

    // Fetch wishlist when the wishlist tab is opened
    useEffect(() => {
        if (activeTab !== "wishlist") return;

        let isCancelled = false;
        const fetchDetailedWishlist = async () => {
            setLoadingWishlist(true);
            try {
                const data = await getWishlistApi();
                if (!isCancelled && data.success) setWishlistData(data.wishlist);
            } catch (error) {
                console.error("Failed to load wishlist", error);
            } finally {
                if (!isCancelled) setLoadingWishlist(false);
            }
        };

        fetchDetailedWishlist();
        return () => { isCancelled = true; }; // avoid state update after unmount/tab switch
    }, [activeTab]);

    // ── Handlers ──────────────────────────────────────────────

    const handleRemoveWishlistItem = useCallback((e, productId) => {
        handleToggleWishlist(e, productId);
        setWishlistData((prev) => prev.filter((item) => item._id !== productId));
    }, [handleToggleWishlist]);

    const handleProfileChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleProfileUpdate = useCallback((e) => {
        e.preventDefault();
        if (formData.newPassword && formData.newPassword.length < 6) {
            return toast.error("New password min 6 chars.");
        }
        if (formData.newPassword && !formData.currentPassword) {
            return toast.error("Current password required.");
        }

        dispatch(updateProfile(formData)).then((action) => {
            if (action.meta.requestStatus === "fulfilled") {
                setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
            }
        });
    }, [dispatch, formData]);

    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await authLogout(); // API call + redux clear happens inside useAuth
            toast.success("Logged out successfully", successToastStyle);
            setShowLogoutModal(false);
            navigate("/login");
        } catch (error) {
            toast.error(`Logout failed: ${error?.message || "Please try again."}`, errorToastStyle);
        } finally {
            setIsLoggingOut(false);
        }
    }, [authLogout, navigate]);

    const confirmCancellation = useCallback(() => {
        if (cancelModalOpen) {
            handleCancelMyOrder(cancelModalOpen);
            setCancelModalOpen(null);
        }
    }, [cancelModalOpen, handleCancelMyOrder]);

    // ── Derived State ─────────────────────────────────────────

    const activeOrders = useMemo(() => {
        return (Array.isArray(buyerOrders) ? buyerOrders : []).filter(
            (order) => order.orderStatus === "Processing" || order.orderStatus === "Shipped"
        );
    }, [buyerOrders]);
    const hasActiveOrders = activeOrders.length > 0;

    // ── Reusable Settings Form ───────────────────────────────

    const renderSettingsForm = () => (
        <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-4">
                <Settings size={18} className="text-stone-900" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Account Settings</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">Full Name</label>
                        <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleProfileChange}
                            className="w-full p-4 bg-[#fbfaf9] border border-stone-200 rounded-xl text-xs font-bold outline-none focus:border-stone-900 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">Contact Number</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleProfileChange}
                            className="w-full p-4 bg-[#fbfaf9] border border-stone-200 rounded-xl text-xs font-bold outline-none focus:border-stone-900 transition-colors"
                        />
                    </div>
                </div>
                <hr className="border-stone-100 my-8" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 mb-4">Security Update</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleProfileChange}
                            placeholder="Required to change"
                            className="w-full p-4 bg-[#fbfaf9] border border-stone-200 rounded-xl text-xs font-bold outline-none focus:border-stone-900 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-stone-500">New Vault Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleProfileChange}
                            placeholder="Leave blank to keep current"
                            className="w-full p-4 bg-[#fbfaf9] border border-stone-200 rounded-xl text-xs font-bold outline-none focus:border-stone-900 transition-colors"
                        />
                    </div>
                </div>
                <button
                    disabled={updateLoading}
                    className="w-full bg-stone-900 text-white py-4 mt-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ccff00] hover:text-stone-900 transition-all disabled:opacity-50 shadow-md"
                >
                    {updateLoading ? "Syncing..." : "Save Changes"}
                </button>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f7f6f4] text-stone-900 pt-[120px] pb-24 px-6 lg:px-12 font-sans relative">
            <div className="max-w-[1200px] mx-auto">
                <button
                    onClick={() => (activeTab === "settings" ? setActiveTab(isSeller ? "dashboard" : "orders") : navigate("/"))}
                    className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-all group py-6"
                >
                    <div className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center group-hover:border-stone-900 group-hover:bg-stone-100 transition-colors">
                        <ChevronLeft size={14} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">
                        {activeTab === "settings" ? "Back to Hub" : "Exit Profile"}
                    </span>
                </button>

                {/* ── HEADER ── */}
                <div className="bg-white border border-stone-200 rounded-2xl p-8 lg:p-10 shadow-sm mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 rounded-bl-full -z-10"></div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-stone-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black uppercase shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                                {currentUser?.fullname?.charAt(0) || "U"}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-3xl font-black uppercase tracking-tighter italic">{currentUser?.fullname}</h1>
                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isSeller ? "bg-[#ccff00]/20 text-[#8cb300]" : "bg-stone-100 text-stone-500"}`}>
                                        {isSeller ? (<><ShieldCheck size={10} /> Merchant</>) : "Elite Member"}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-stone-500 text-[11px] font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Mail size={12} /> {currentUser?.email}</span>
                                    <span className="flex items-center gap-1.5"><Phone size={12} /> {currentUser?.contact || "No contact added"}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 text-red-500 bg-red-50 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-700 transition-colors">
                            <LogOut size={14} /> Log Out
                        </button>
                    </div>
                </div>

                {/* ── ROLE BASED CONTENT ── */}
                {isSeller ? (
                    activeTab === "settings" ? (
                        <div className="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-sm">{renderSettingsForm()}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                            <div onClick={() => navigate("/seller/dashboard")} className="bg-white border border-stone-200 p-8 rounded-2xl cursor-pointer hover:border-stone-900 transition-all group shadow-sm">
                                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#ccff00] transition-colors"><LayoutGrid size={20} className="text-stone-900" /></div>
                                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Inventory Detail</h2>
                                <p className="text-xs text-stone-500 font-medium mb-6">Manage your product catalog and update stock.</p>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-900 group-hover:translate-x-2 transition-transform">Access Vault <ArrowRight size={14} /></div>
                            </div>
                            <div onClick={() => navigate("/seller/orders")} className="bg-white border border-stone-200 p-8 rounded-2xl cursor-pointer hover:border-stone-900 transition-all group shadow-sm">
                                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#ccff00] transition-colors"><Package size={20} className="text-stone-900" /></div>
                                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Order Detail</h2>
                                <p className="text-xs text-stone-500 font-medium mb-6">Track customer purchases and fulfillment status.</p>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-900 group-hover:translate-x-2 transition-transform">Open Command Center <ArrowRight size={14} /></div>
                            </div>
                            <div onClick={() => setActiveTab("settings")} className="bg-stone-900 border border-stone-800 p-8 rounded-2xl cursor-pointer hover:bg-stone-800 transition-all group shadow-sm">
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#ccff00] transition-colors"><Settings size={20} className="text-white group-hover:text-stone-900" /></div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">Profile Settings</h2>
                                <p className="text-xs text-stone-400 font-medium mb-6">Update contact details and secure passwords.</p>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ccff00] group-hover:translate-x-2 transition-transform">Modify Assets <ArrowRight size={14} /></div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in-up">
                        {/* LEFT SIDEBAR (BUYER) */}
                        <div className="w-full lg:w-[30%] space-y-6">
                            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-400 mb-4 border-b border-stone-100 pb-2">Account Hub</h3>
                                <div className="space-y-1">
                                    {BUYER_TABS.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-stone-900 text-[#ccff00]" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"}`}
                                        >
                                            <tab.icon size={16} /> {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full"></div>
                                <LifeBuoy size={28} className="text-[#ccff00] mb-5 relative z-10" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2 relative z-10">Priority Support</h3>
                                <p className="text-[10px] text-stone-400 font-medium leading-relaxed mb-6 relative z-10">Terminal Elite members get 24/7 direct access to our logistics team.</p>
                                <button className="w-full bg-[#ccff00] text-stone-900 font-black uppercase text-[10px] py-3 rounded-xl hover:bg-white transition-colors relative z-10">Contact Agent</button>
                            </div>
                        </div>

                        {/* RIGHT CONTENT (BUYER) */}
                        <div className="w-full lg:w-[70%] bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-sm">
                            {activeTab === "orders" && (
                                <div className="animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-4">
                                        <div className="flex items-center gap-3"><Clock size={18} /><h2 className="text-sm font-black uppercase tracking-[0.2em]">Active Deliveries</h2></div>
                                        <button onClick={() => navigate("/order-history")} className="text-[10px] font-black text-stone-500 uppercase tracking-widest hover:text-stone-900 underline underline-offset-4">
                                            View All History <ArrowRight size={12} className="inline mb-0.5" />
                                        </button>
                                    </div>
                                    {isLoading && !hasActiveOrders ? (
                                        <div className="py-16 text-center text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 animate-pulse">Tracking Assets...</div>
                                    ) : !hasActiveOrders ? (
                                        <div className="py-20 text-center">
                                            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-stone-200"><Package size={28} className="text-stone-300" /></div>
                                            <p className="text-stone-400 text-[11px] uppercase tracking-[0.3em] font-black mb-6">No active deliveries</p>
                                            <button onClick={() => navigate("/order-history")} className="bg-stone-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase hover:bg-[#ccff00] hover:text-stone-900 transition-all shadow-md">Past Records</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {activeOrders.map((order, idx) => (
                                                <div key={order._id || idx} className="border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-colors">
                                                    <div className="bg-stone-50 p-5 border-b border-stone-200 flex flex-col md:flex-row justify-between gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Order #{order._id?.slice(-8).toUpperCase()}</span>
                                                            <span className="text-xs font-bold text-stone-900">{new Date(order.createdAt).toLocaleDateString("en-GB")}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="flex flex-col justify-center px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm">
                                                                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-stone-400 mb-0.5">Net Value</span>
                                                                <span className="text-sm font-black text-stone-900">₹{order.totalAmount}</span>
                                                            </div>
                                                            <div className="flex flex-col justify-center px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm">
                                                                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-stone-400 mb-1">Live Status</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    {order.orderStatus === "Processing" && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>}
                                                                    <span className="text-[10px] font-black uppercase text-stone-900">{order.orderStatus}</span>
                                                                </div>
                                                            </div>
                                                            {order.orderStatus === "Processing" && (
                                                                <button onClick={() => setCancelModalOpen(order._id)} className="flex flex-col justify-center px-4 py-2 bg-white border border-stone-200 rounded-lg shadow-sm hover:border-red-500 hover:bg-red-50 group">
                                                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-red-400">Action</span>
                                                                    <span className="text-[10px] font-black uppercase text-stone-400 group-hover:text-red-600">Cancel</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="p-5 space-y-5 bg-white">
                                                        {order.items?.map((item, i) => (
                                                            <div key={i} className="flex gap-5 items-center">
                                                                <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden border border-stone-100 shrink-0">
                                                                    <img src={item.product?.images?.[0]?.url} alt="product" className="w-full h-full object-cover mix-blend-multiply" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="text-xs font-black uppercase tracking-tight mb-1">{item.product?.title}</h3>
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Qty: {item.quantity}</p>
                                                                </div>
                                                                <span className="text-xs font-black">₹{item.price?.amount || item.product?.price?.amount}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "wishlist" && (
                                <div className="animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-4"><Heart size={18} /><h2 className="text-sm font-black uppercase tracking-[0.2em]">Your Archive</h2></div>
                                    {loadingWishlist ? (
                                        <div className="py-16 text-center text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 animate-pulse">Loading Archive...</div>
                                    ) : wishlistData.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-stone-200"><Heart size={28} className="text-stone-300" /></div>
                                            <p className="text-stone-400 text-[11px] uppercase tracking-[0.3em] font-black mb-6">Archive is Empty</p>
                                            <button onClick={() => navigate("/shop")} className="bg-stone-900 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase hover:bg-[#ccff00] hover:text-stone-900 transition-all shadow-md">Explore Assets</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                                            {wishlistData.map((item) => (
                                                <div key={item._id} className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm flex flex-col">
                                                    <button onClick={(e) => handleRemoveWishlistItem(e, item._id)} className="absolute top-2 right-2 z-10 p-2 bg-white/90 border border-stone-200 rounded-full text-stone-400 hover:text-red-500 hover:border-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <Link to={`/product/${item._id}`} className="aspect-[3/4] bg-stone-100 overflow-hidden">
                                                        <img src={item.images?.[0]?.url} alt={item.title} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-[2s]" />
                                                    </Link>
                                                    <div className="p-4 flex flex-col flex-1">
                                                        <Link to={`/product/${item._id}`}><h3 className="text-[10px] font-black uppercase tracking-widest truncate mb-1">{item.title}</h3></Link>
                                                        <p className="text-stone-500 text-[9px] font-bold mt-auto pt-2">{item.price?.currency} {item.price?.amount}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "settings" && renderSettingsForm()}
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODALS ── */}
            {cancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-stone-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} className="text-red-500" /></div>
                            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Abort Transaction?</h3>
                            <p className="text-xs font-medium text-stone-500">Action cannot be reversed.</p>
                        </div>
                        <div className="flex border-t border-stone-100">
                            <button onClick={() => setCancelModalOpen(null)} className="flex-1 py-4 text-[10px] font-black uppercase text-stone-500 hover:bg-stone-50 border-r border-stone-100">Nevermind</button>
                            <button onClick={confirmCancellation} className="flex-1 py-4 text-[10px] font-black uppercase text-red-500 hover:bg-red-50">Confirm Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-stone-200 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-fade-in-up">
                        <div>
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-stone-900">Confirm Logout</h3>
                            <p className="text-[10px] text-stone-500 italic mt-1">Are you sure you want to exit?</p>
                        </div>
                        <div className="border-t border-stone-100" />
                        <div className="flex justify-end gap-3">
                            <button disabled={isLoggingOut} onClick={() => setShowLogoutModal(false)} className="px-4 py-2.5 text-[9px] font-black uppercase border border-stone-200 rounded-lg text-stone-500 hover:bg-stone-50">Cancel</button>
                            <button disabled={isLoggingOut} onClick={handleLogout} className="px-4 py-2.5 text-[9px] font-black uppercase bg-stone-900 text-white rounded-lg hover:bg-red-500 flex items-center gap-2">
                                {isLoggingOut ? <span className="w-3 h-3 border-2 border-t-white rounded-full animate-spin" /> : <LogOut size={12} />}
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