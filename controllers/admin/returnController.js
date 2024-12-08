const Return = require("../../models/returnSchema");
const Wallet = require("../../models/walletSchema");
const Order = require("../../models/orderSchema");
const Notification = require("../../models/notificationSchema");

const getReturnApprovals = async (req, res) => {
    try {
        
        const returnData = await Return.find().sort({createdAt:-1})
            .populate('orderId', 'orderId status finalAmount')
            .populate('userId', 'name email');
        
        res.render('returnapprovals', {
            returns: returnData, 
        });
    } catch (error) {
        console.error('Error fetching return approvals:', error);
        res.status(500).send('Server error');
    }
};

const returnUpdate = async (req, res) => {
    try {
        const returnId = req.query.id;
        const { status } = req.body;

       
        const returnData = await Return.findById(returnId);
        if (!returnData) {
            return res.status(404).json({ message: "Return request not found" });
        }

        const userId = returnData.userId;
        const orderId = returnData.orderId;
        const refundAmount = returnData.refundAmount;

        if (status === "approved") {
            
            const wallet = await Wallet.findOneAndUpdate(
                { userId },
                { 
                    $inc: { balance: refundAmount },
                    $push: {
                        transactions: {
                            type: 'credit',
                            amount: refundAmount,
                            description: "Refund for your returned product",
                            orderId,
                            date: new Date()
                        }
                    }
                },
                { new: true, upsert: true }
            );

            
            returnData.returnStatus = "approved";
            await returnData.save();

            await Order.findByIdAndUpdate(
                orderId,
                { status: "Returned" }
            );

            
            await Notification.create({
                userId,
                message: "Your return request has been approved. The refund amount has been credited to your wallet.",
                status: "unread"
            });
        } else if (status === "rejected") {
           
            returnData.returnStatus = "rejected";
            await returnData.save();

            await Order.findByIdAndUpdate(
                orderId,
                { status: "Return Request Rejected" }
            );

            
            await Notification.create({
                userId,
                message: "Your return request has been rejected.",
                status: "unread"
            });
        } else {
            return res.status(400).json({ message: "Invalid status value" });
        }

        return res.redirect(`/admin/returnApprovals`);
    } catch (error) {
        console.error("Error updating return status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getReturnApprovals,
    returnUpdate,
};
