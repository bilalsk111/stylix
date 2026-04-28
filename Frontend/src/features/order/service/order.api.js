import axios from "axios";

const orderApiInstance = axios.create({
    baseURL: "/api/orders",
    withCredentials: true;
});

export const fetchAllAdminOrders = async () => {
    const res = await orderApiInstance.get('/seller/all');
    return res.data;
};

export const updateOrderStatusApi = async (orderId, newStatus) => {
    const res = await orderApiInstance.put(`/seller/${orderId}/status`, { orderStatus: newStatus });
    return res.data;
};

export const deleteOrderApi = async (orderId) => {
    const res = await orderApiInstance.delete(`/seller/${orderId}`);
    return res.data;
};

export const getMyOrdersApi = async () => {
    const res = await orderApiInstance.get('/my-orders');
    return res.data;
};