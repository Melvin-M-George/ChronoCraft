

const Address = require("../../models/addressSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/ProductSchema");
const Wallet = require("../../models/walletSchema");
const Return = require("../../models/returnSchema");




const getIndividualOrderDetails = async (req, res) => {
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

    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentMethod === 'COD') {
            order.status = 'Cancelled';
            await order.save();
            return res.json({ message: 'Order cancelled successfully' });
        }
        
        if (order.paymentMethod === 'online' || order.paymentMethod === 'wallet') {
            const userId = req.session.user;

            if (!userId) {
                return res.status(400).json({ message: 'User not authenticated' });
            }

            const amount = order.finalAmount;

            let wallet = await Wallet.findOne({ userId });
            if (!wallet) {
                wallet = new Wallet({
                    userId,
                    balance: amount,
                    transactions: [{
                        type: 'refund',
                        amount,
                        orderId: id,
                        description: 'Order refund',
                    }],
                });
            } else {
                wallet.balance += amount;
                wallet.transactions.push({
                    type: 'refund',
                    amount,
                    orderId: id,
                    description: 'Order refund',
                });
            }
       
            await wallet.save();
            order.status = 'Cancelled';
            await order.save();

            return res.json({ message: 'Order cancelled and refund processed successfully' });
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ message: 'Failed to cancel order' });
    }
};


const returnOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const userId = req.session.user._id;

        const orderData = await Order.findById(orderId);
        if (!orderData) {
            return res.status(404).json({ message: 'Order not found' });
        }

        
        if (orderData.status !== 'Delivered') {
            return res.status(400).json({ message: 'Only delivered orders can be returned' });
        }

        const existingReturn = await Return.findOne({ orderId });
        if (existingReturn) {
            return res.status(400).json({ message: 'Return request already submitted for this order' });
        }

        const returnRequest = new Return({
            userId,
            orderId,
            reason,
            refundAmount: orderData.finalAmount,
        });

        await returnRequest.save();

        orderData.status = 'Return Request';
        await orderData.save();

        return res.status(200).json({ message: 'Return request submitted successfully' });
    } catch (error) {
        console.error('Error processing return request:', error);
        return res.status(500).json({ message: 'Something went wrong, please try again later.' });
    }
};


const getOrderConfimation = async (req,res) => {
    try {
        return res.render("orderConfirmation");
    } catch (error) {
        console.log("Error loading order confirmation page",error);
    }
}

module.exports = {
    
    cancelOrder,
    getIndividualOrderDetails,
    returnOrder,
    getOrderConfimation,
    


}