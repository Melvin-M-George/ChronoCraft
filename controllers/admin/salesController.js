const Order = require("../../models/orderSchema");
const User = require("../../models/userSchema");



const getSalesReport = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const filterOrders = { status: { $nin: ["Cancelled", "Returned"] } };
        const count = await Order.countDocuments(filterOrders);
        const totalPages = Math.ceil(count / limit);

        const orderData = await Order.find(filterOrders)
            .populate("user")
            .populate("orderedItems.product")
            .sort({ createdOn: -1 })
            .skip(skip)
            .limit(limit);


            const totalSales = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalSalesAmount: { $sum: "$finalAmount" }
                    }
                }
            ]);

            const totalOrders = await Order.countDocuments();

            const totalDiscount = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalDiscountAmount: { $sum: "$discount" }
                    }
                }
            ]);

            const uniqueUserIds = await Order.distinct("user");
            const uniqueUsersCount = uniqueUserIds.length;


            let salesTotal = totalSales[0];
            let discountTotal = totalDiscount[0];
            console.log(totalDiscount);

        res.render("salesreport", {
            orders: orderData,
            count,
            totalPages,
            currentPage: page,
            totalSales:salesTotal,
            totalOrders,
            totalDiscount:discountTotal,
            totalUsers:uniqueUsersCount,
        });


    } catch (error) {
        console.error("Error loading sales report", error);
        res.redirect("/pageerror");
    }
};




module.exports = {
    getSalesReport,

}