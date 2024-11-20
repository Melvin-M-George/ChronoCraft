
const Coupons = require("../../models/couponSchema");


const getCouponList = async (req,res) => {
    try {
        const user = req.session.user;
        if(!user){
            return res.redirect("/login");
        }

        const coupons = await Coupons.find({
            isActive:true,
            userId:{$ne:user}
        })

        res.render("couponList",{coupons})
    } catch (error) {
        console.error("Error loading coupon list",error);
        res.redirect("/pageNotFound");
    }
}

const applyCoupon = async (req,res) => {
    try {
        const { couponCode, cartTotal } = req.body;

     
        const coupon = await Coupons.findOne({ code: couponCode, isActive: true });

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid or expired coupon code.' });
        }

        const currentDate = new Date();
        if (currentDate > coupon.endOn) {
            return res.status(400).json({ message: 'This coupon has expired.' });
        }

        
        if (cartTotal < coupon.minimumAmount) {
            return res.status(400).json({ 
                message: `This coupon requires a minimum purchase of ₹${coupon.minimumAmount}.` 
            });
        }

        
        const discount = (cartTotal * coupon.price) / 100;
        const totalAfterDiscount = Math.max(cartTotal - discount, 0);

        res.status(200).json({
            message: 'Coupon applied successfully!',
            discount,
            totalAfterDiscount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = {
    getCouponList,
    applyCoupon,

}