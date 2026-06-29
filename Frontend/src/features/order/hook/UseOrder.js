import { useDispatch, useSelector } from "react-redux";
import { cancelMyOrderApi, deleteOrderApi, fetchAllAdminOrders, getMyOrdersApi, updateOrderStatusApi } from "../service/order.api";
import { setAdminOrders, setLoading, setError, updateOrderStatusLocally, removeOrderLocally, setBuyerOrders, cancelBuyerOrderLocally } from "../state/order.slice";
import toast from "react-hot-toast";

export const useOrder = () => {
    const dispatch = useDispatch();
const { adminOrders, buyerOrders, isLoading, error } = useSelector((state) => state.order);

    const handleFetchAllOrders = async () => {
        try {
            dispatch(setLoading(true));
            const data = await fetchAllAdminOrders();
            if (data.success) {
                dispatch(setAdminOrders(data.orders));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch orders";
            dispatch(setError(errorMsg));
            toast.error(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        // Optimistic UI Update: Update Redux immediately so the UI feels instant
        dispatch(updateOrderStatusLocally({ orderId, status: newStatus }));
        
        try {
            const data = await updateOrderStatusApi(orderId, newStatus);
            if (data.success) {
                toast.success(`Order marked as ${newStatus}`);
            }
        } catch (err) {
            // Revert on failure by re-fetching the true state from DB
            toast.error("Failed to update status. Reverting.");
            handleFetchAllOrders(); 
        }
    };
const handleDeleteOrder = async (orderId) => {
    // UI se turant hata do (Fast UX)
    dispatch(removeOrderLocally(orderId));

    try {
        const data = await deleteOrderApi(orderId);
        if (data.success) {
            toast.success("Order deleted permanently.");
        }
    } catch (err) {
        // Agar DB mein delete nahi hua kisi error ki wajah se, toh revert karo aur data wapas fetch karo
        const errorMsg = err.response?.data?.message || "Failed to delete order.";
        toast.error(errorMsg);
        handleFetchAllOrders(); // Sync back with DB
    }
};
const handleFetchMyOrders = async () => {
    try {
        dispatch(setLoading(true));
        const data = await getMyOrdersApi(); 
        // console.log("TRACKER 1 - RAW API DATA:", data); 

        const finalOrders = Array.isArray(data) ? data : (data?.orders || []);
        
        // console.log("TRACKER 2 - FINAL ORDERS ARRAY:", finalOrders); 

        dispatch(setBuyerOrders(finalOrders)); 
        
    } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to fetch orders";
        dispatch(setError(errorMsg));
        // console.error("Order Fetch Error:", errorMsg);
    } finally {
        dispatch(setLoading(false));
    }
};

const handleCancelMyOrder = async (orderId) => {
    // Optimistic Update: UI me turant "Cancelled" dikha do
    dispatch(cancelBuyerOrderLocally(orderId));
    
    try {
        const data = await cancelMyOrderApi(orderId);
        if (data.success) {
            toast.success("Order Cancelled");
        }
    } catch (err) {
        toast.error("Failed to cancel order");
        handleFetchMyOrders(); // Agar fail hua toh DB se wapas purana data manga lo
    }
};
    return {
        adminOrders,
        isLoading,
        error,
        buyerOrders,
        handleFetchAllOrders,
        handleUpdateStatus,
       handleDeleteOrder,
       handleFetchMyOrders,
       handleCancelMyOrder
    };
};