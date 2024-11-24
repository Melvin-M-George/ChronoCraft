const Coupons = require("../../models/couponSchema");


const getCouponPage = async (req,res) => {
    try {
        const coupons = await Coupons.find();
        return res.render("coupons",{coupons});
    } catch (error) {
        console.log("Error getting coupon page",error)
        return res.redirect("/pageerror")
    }
}

const addCoupon = async (req,res) => {
    try {
        const {couponCode,discountPercentage,minimumPrice, maximumPrice, createdDate, endDate} = req.body;
        const couponExisting = await Coupons.findOne({couponCode});

        if(couponExisting){
            return res.status(400).json({message:"This coupon already exists"});
        }

        const createdOnDate = new Date(createdDate);
        const endOnDate = new Date(endDate);
        const currentDate = new Date();
        const isActive = currentDate >= createdOnDate && currentDate <= endOnDate;

        const newCoupon = new Coupons({
            code:couponCode,
            price:discountPercentage,
            minimumAmount:minimumPrice,
            maximumAmount:maximumPrice,
            createdOn:createdOnDate,
            endOn:endOnDate,
            isActive
        })

        await newCoupon.save();
        return res.redirect("/admin/coupons");
    } catch (error) {
        console.error("Error adding coupon:",error);
        return res.status(500).json({message:"An error occured while adding coupon. Please try again later"});
    }
}

const deleteCoupon = async (req,res) => {
    try {
        const couponId = req.query.id;
        await Coupons.findByIdAndDelete(couponId);
        return res.redirect("/admin/coupons");
    } catch (error) {
        
    }
}

module.exports = {
    getCouponPage,
    addCoupon,
    deleteCoupon,




}