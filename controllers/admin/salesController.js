const Order = require("../../models/orderSchema");
const User = require("../../models/userSchema");



const getSalesReport = async (req,res) => {
    try {
        
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page-1) * limit;
        const count = await Order.countDocuments();
        const totalPages = Math.ceil(count / limit);
        
        
        const orderData = await Order.find().populate("user").populate("orderedItems.product").sort({createdOn:-1}).skip(skip).limit(limit);

        
        res.render("salesreport",{orders:orderData,count,totalPages,currentPage:page});
        
    } catch (error) {
        console.error("Error loading sales report",error);
        res.redirect("/pageerror");
    }
}




module.exports = {
    getSalesReport,

}