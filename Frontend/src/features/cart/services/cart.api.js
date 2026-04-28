import axios from "axios"


const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})



export const addItem = async ({ productId, variantId, quantity }) => {
    const res = await cartApiInstance.post(`/add/${productId}/${variantId}`, {
        quantity: quantity || 1 
    });
    return res.data;
}
export const getCart = async () => {
    const res = await cartApiInstance.get()

    return res.data
}

// FIX: req.body mein quantity bhejna zaroori hai!
export const updateCartItemQuantity = async({ productId, variantId, quantity }) => {
    const res = await cartApiInstance.patch(`/qty/${productId}/${variantId}`, { quantity });
    return res.data;
}

export const removeCartItem = async({ productId, variantId }) => {
    const res = await cartApiInstance.delete(`/del/${productId}/${variantId}`);
    return res.data;
}

export const createOrder = async(payload)=>{
    const res =await cartApiInstance.post('/create-order', payload)
    return res.data
}

export const verifyPayment = async (payload) => {
    const res = await cartApiInstance.post('/verify-payment', payload);
    return res.data;
};
