import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../hook/UseOrder";
import { useAuth } from "../../auth/hook/useAuth";
import { Package, ArrowLeft, LogOut, LayoutGrid, CheckCircle2, Truck, XCircle, Search, Trash2 } from "lucide-react";
import { useState } from "react";

const SellerOrder = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { adminOrders, isLoading, handleFetchAllOrders, handleUpdateStatus, handleDeleteOrder } = useOrder();
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null });

    useEffect(() => {
        handleFetchAllOrders();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case "Processing": return "bg-orange-100 text-orange-700 border-orange-200";
            case "Shipped": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Delivered": return "bg-[#ccff00]/30 text-[#8cb300] border-[#a3cc00]";
            case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-stone-100 text-stone-500 border-stone-200";
        }
    };

    if (isLoading && adminOrders.length === 0) {
        return (
            <div className="h-screen bg-[#f7f6f4] flex items-center justify-center">
                <div className="text-stone-900 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                    Fetching Dispatch Records...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f7f6f4] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">

            {/* FIXED NAVIGATION */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#f7f6f4]/90 backdrop-blur-xl border-b border-stone-200 px-6 lg:px-10 h-20 flex items-center justify-between">
                <button
                    onClick={() => navigate("/seller/dashboard")}
                    className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-all group"
                >
                    <div className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center group-hover:border-stone-900 group-hover:bg-stone-100 transition-colors">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Back to Dashboard</span>
                </button>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#a3d100]">Order Management</span>
                        <span className="text-[10px] text-stone-400 font-bold lowercase italic truncate max-w-[150px]">{currentUser?.email}</span>
                    </div>
                    <div className="h-8 w-[1px] bg-stone-200"></div>
                    <button
                        onClick={() => navigate("/")}
                        className="p-2.5 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all rounded-full border border-stone-200 shadow-sm"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </nav>

            <div className="px-6 lg:px-12 pt-[120px] lg:pt-[160px] pb-24 max-w-[1600px] mx-auto">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic mb-2 text-stone-900">
                            Fulfillment Center
                        </h1>
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                            Manage logistics, tracking, and customer orders
                        </p>
                    </div>
                    <div className="bg-white border border-stone-200 px-5 py-3 rounded-xl shadow-sm flex items-center gap-3 w-fit">
                        <Package size={18} className="text-stone-900" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Total Volumes</span>
                            <span className="text-sm font-black text-stone-900 leading-none">{adminOrders.length} Orders</span>
                        </div>
                    </div>
                </div>

                {/* DATA TABLE SECTION */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                        <div className="flex items-center gap-3">
                            <LayoutGrid size={16} className="text-stone-400" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-900">Active Ledger</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200 text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
                                    <th className="p-5 whitespace-nowrap">Order ID</th>
                                    <th className="p-5 whitespace-nowrap">Timestamp</th>
                                    <th className="p-5 whitespace-nowrap">Items</th> {/* 🔥 Naya Column */}
                                    <th className="p-5 whitespace-nowrap">Customer Info</th>
                                    <th className="p-5 whitespace-nowrap">Value</th>
                                    <th className="p-5 whitespace-nowrap">Payment</th>
                                    <th className="p-5 whitespace-nowrap text-right">Actions</th> {/* 🔥 Updated Column */}
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium">
                                {adminOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-stone-100 hover:bg-stone-50/80 transition-colors group">
                                        <td className="p-5 font-black text-stone-900 text-xs">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="p-5 text-stone-500 text-[11px] font-bold">
                                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* 🔥 FIX: Products Image Stack */}
                                        <td className="p-5">
                                            <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                                                {order.items?.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="w-9 h-11 rounded-md overflow-hidden border-2 border-white shadow-sm bg-stone-100 relative z-10 shrink-0">
                                                        <img
                                                            src={item.product?.images?.[0]?.url || "https://via.placeholder.com/150"}
                                                            alt="product"
                                                            className="w-full h-full object-cover mix-blend-multiply"
                                                        />
                                                    </div>
                                                ))}
                                                {order.items?.length > 3 && (
                                                    <div className="w-9 h-11 rounded-md border-2 border-white bg-stone-100 flex items-center justify-center text-[9px] font-black text-stone-500 relative z-10 shrink-0">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-5">
                                            <p className="text-stone-900 font-bold text-xs uppercase tracking-tight">{order.user?.fullname}</p>
                                            <p className="text-[10px] text-stone-400 mt-1 font-medium">{order.user?.email}</p>
                                        </td>
                                        <td className="p-5 font-black text-stone-900 text-sm">
                                            ₹{order.totalAmount}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'bg-[#ccff00]/20 text-[#8cb300]' : 'bg-stone-200 text-stone-600'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>

                                        {/* 🔥 FIX: Dropdown + Delete Button */}
                                        <td className="p-5 flex items-center justify-end gap-3">
                                            <select
                                                value={order.orderStatus}
                                                onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                                className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-lg border outline-none cursor-pointer appearance-none transition-colors ${getStatusStyle(order.orderStatus)} hover:opacity-80`}
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>

                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, orderId: order._id })}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-stone-200 rounded-lg text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* EMPTY STATE */}
                        {adminOrders.length === 0 && (
                            <div className="p-16 flex flex-col items-center justify-center bg-white">
                                <Search size={32} className="text-stone-200 mb-4" />
                                <p className="text-stone-400 text-[10px] uppercase tracking-[0.5em] font-black italic">No dispatch records found</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm px-4">
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-2xl max-w-sm w-full animate-fade-in-up">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-5 border border-red-200">
                            <Trash2 size={20} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tighter text-stone-900 mb-2">Delete Record?</h3>
                        <p className="text-[11px] text-stone-500 font-medium mb-8 leading-relaxed">
                            Are you absolutely sure you want to permanently delete order <span className="font-bold text-stone-900">#{deleteModal.orderId?.slice(-8).toUpperCase()}</span>? This action cannot be reversed.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, orderId: null })}
                                className="flex-1 bg-stone-100 text-stone-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteOrder(deleteModal.orderId);
                                    setDeleteModal({ isOpen: false, orderId: null });
                                }}
                                className="flex-1 bg-red-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                            >
                                Delete Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerOrder;