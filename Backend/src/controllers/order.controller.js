import Order from '../models/order.model.js';


export const getAllOrdersAdmin = async (req, res) => {
    try {
        // Find all orders, populate user details and product details
        // .sort({ createdAt: -1 }) ensures newest orders show up first
        const orders = await Order.find()
            .populate("user", "fullname email contact") // User collection se ye fields aayengi
            .populate("items.product", "title images price") // Product collection se ye aayega
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error("Get All Orders Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateOrderStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params; // Order ID URL se aayegi
        const { orderStatus } = req.body;

        // Strict Validation: Kachra status allow mat karo
        const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ success: false, message: "Invalid order status provided." });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        // Update the status
        order.orderStatus = orderStatus;
        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${orderStatus}`,
            order
        });

    } catch (error) {
        console.error("Update Order Status Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteOrderAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedOrder = await Order.findByIdAndDelete(id);
        
        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Order permanently deleted."
        });
    } catch (error) {
        console.error("Delete Order Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        // Sirf is user ke orders dhundho
        const orders = await Order.find({ user: userId })
            .populate("items.product", "title images price") // Product ki image aur naam ke liye
            .sort({ createdAt: -1 }); // Newest pehle

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error("Get My Orders Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};