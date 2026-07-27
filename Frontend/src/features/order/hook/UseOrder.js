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
        // Optimistic update is fine here since it's an admin rapid-action
        dispatch(updateOrderStatusLocally({ orderId, status: newStatus }));
        
        try {
            const data = await updateOrderStatusApi(orderId, newStatus);
            if (data.success) {
                toast.success(`Order marked as ${newStatus}`);
            }
        } catch (err) {
            toast.error("Failed to update status. Reverting UI to match Database.");
            handleFetchAllOrders(); 
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            dispatch(setLoading(true));
            // First wait for DB to confirm deletion
            const data = await deleteOrderApi(orderId);
            
            if (data && data.success) {
                // Only remove from Redux UI AFTER DB confirms it's gone
                dispatch(removeOrderLocally(orderId));
                toast.success("Order deleted permanently.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to delete order.";
            toast.error(errorMsg);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleFetchMyOrders = async () => {
        try {
            dispatch(setLoading(true));
            const data = await getMyOrdersApi(); 
            const finalOrders = Array.isArray(data) ? data : (data?.orders || []);
            dispatch(setBuyerOrders(finalOrders)); 
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch your orders";
            dispatch(setError(errorMsg));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleCancelMyOrder = async (orderId) => {
        try {
            dispatch(setLoading(true));
            // Wait for DB to confirm cancellation before updating UI
            const data = await cancelMyOrderApi(orderId);
            
            if (data && data.success) {
                dispatch(cancelBuyerOrderLocally(orderId));
                toast.success("Order Cancelled successfully.");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to cancel order.";
            toast.error(errorMsg);
        } finally {
            dispatch(setLoading(false));
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