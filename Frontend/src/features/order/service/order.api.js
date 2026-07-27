import axios from "axios";

const orderApiInstance = axios.create({
    baseURL: "/api/orders",
    withCredentials: true
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

export const cancelMyOrderApi = async (orderId) => {
    const res = await orderApiInstance.put(`/my-orders/${orderId}/cancel`);
    return res.data;
};

// 🔥 MOVED FROM CART API: Ab yeh /api/orders/create-order par request bhejenge
export const createOrder = async (payload) => {
    const res = await orderApiInstance.post('/create-order', payload);
    return res.data;
};

export const verifyPayment = async (payload) => {
    const res = await orderApiInstance.post('/verify-payment', payload);
    return res.data;
};