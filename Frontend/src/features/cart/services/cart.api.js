import axios from "axios"


const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})


export const addItem = async ({ productId, variantId }) => {
    const res = await cartApiInstance.post(`/add/${productId}/${variantId}`, {
        quantity: 1
    })

    return res.data
}
export const getCart = async () => {
    const res = await cartApiInstance.get()

    return res.data
}

