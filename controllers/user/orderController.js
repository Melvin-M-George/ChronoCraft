

const Order = require("../../models/orderSchema")





  

const cancelOrder = async (req, res) => {
    const { id } = req.query;
    console.log(id);

    try {
       
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'Pending') {
            return res.status(403).json({ message: 'Cannot cancel this order' });
        }

        order.status = 'Cancelled';
        await order.save();

        return res.redirect("/userProfile");
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ message: 'Failed to cancel order' });
    }
};

module.exports = {
    
    cancelOrder,

}