

const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/ProductSchema");




const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.id; 
        const userId = req.session.user;

        if (!userId) {
            return res.redirect('/login');
        }

        const order = await Order.findById(orderId)
            .populate({
                path: 'orderedItems.product', 
            })
        
            const addressdoc = await Address.findOne({userId}); 

            const address = addressdoc.address.filter(addr => addr._id.toString() === order.address.toString());

            console.log("finded address",address);
            

        if (!order) {
            return res.status(404).send("Order not found.");
        }

        res.render('orderDetails', { order: order,address:address });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.redirect('/pageNotFound');
    }
};
  



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
    getOrderDetails,

}