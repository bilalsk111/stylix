import React, { useEffect, useState } from "react";
import { useOrder } from "../../order/hook/UseOrder"; // Adjust path
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Package, XCircle, CheckCircle } from "lucide-react";

const OrderHistory = () => {
    const { buyerOrders, isLoading, handleFetchMyOrders } = useOrder();
    const navigate = useNavigate();
    
    // UI State for filter tabs
    const [filterStatus, setFilterStatus] = useState("ALL");

    useEffect(() => {
        handleFetchMyOrders();
    }, []);

    const safeOrders = Array.isArray(buyerOrders) ? buyerOrders : [];

    // 🔥 LOGIC: Dynamic Filtering based on selected tab
    const filteredOrders = safeOrders.filter((order) => {
        if (filterStatus === "ALL") return true;
        if (filterStatus === "COMPLETED") return order.orderStatus === "Delivered";
        if (filterStatus === "CANCELLED") return order.orderStatus === "Cancelled";
        return true;
    });

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
            <div className="max-w-[1000px] mx-auto animate-fade-in-up">
                
                {/* Header & Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-all group w-fit"
                    >
                        <div className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center group-hover:border-stone-900 group-hover:bg-stone-100 transition-colors">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Hub</span>
                    </button>
                    
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-stone-900">
                        Order Archive
                    </h1>
                </div>

                {/* FILTER TABS */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 border-b border-stone-200 pb-4">
                    <button 
                        onClick={() => setFilterStatus("ALL")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === "ALL" ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-500 hover:text-stone-900"}`}
                    >
                        <Clock size={14} /> All Records
                    </button>
                    <button 
                        onClick={() => setFilterStatus("COMPLETED")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === "COMPLETED" ? "bg-[#ccff00] text-stone-900" : "bg-white border border-stone-200 text-stone-500 hover:text-stone-900"}`}
                    >
                        <CheckCircle size={14} /> Completed
                    </button>
                    <button 
                        onClick={() => setFilterStatus("CANCELLED")}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === "CANCELLED" ? "bg-red-500 text-white" : "bg-white border border-stone-200 text-stone-500 hover:text-stone-900"}`}
                    >
                        <XCircle size={14} /> Cancelled
                    </button>
                </div>
                {isLoading ? (
                    <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 animate-pulse">
                        Accessing Database...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-24 text-center bg-white border border-stone-200 rounded-3xl">
                        <Package size={32} className="mx-auto text-stone-300 mb-4" />
                        <p className="text-stone-400 text-[11px] uppercase tracking-[0.3em] font-black">No matching records found</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-white border border-stone-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                <div>
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">
                                        Order #{order._id.slice(-8).toUpperCase()}
                                    </span>
                                    <span className="text-sm font-bold text-stone-900">
                                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div>
                                        <span className="block text-[8px] font-black uppercase tracking-widest text-stone-400 mb-1">Total</span>
                                        <span className="text-sm font-black text-stone-900">₹{order.totalAmount || 0}</span>
                                    </div>
                                    <div className="h-8 w-px bg-stone-200"></div>
                                    <span className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.orderStatus)}`}>
                                        {order.orderStatus || "Unknown"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;