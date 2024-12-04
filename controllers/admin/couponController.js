const Coupons = require("../../models/couponSchema");


const getCouponPage = async (req,res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1)*limit;
        const count = await Coupons.countDocuments();
        const totalPages = Math.ceil(count / limit);

        const coupons = await Coupons.find().skip(skip).limit(limit);
        return res.render("coupons",{coupons,totalPages,currentPage:page});


    } catch (error) {
        console.log("Error getting coupon page",error)
        return res.redirect("/pageerror")
    }
}

const addCoupon = async (req,res) => {
    try {
        const {couponCode,discountPercentage,minimumPrice, maximumPrice, createdDate, endDate} = req.body;
        const couponExisting = await Coupons.findOne({code:couponCode});

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
        return res.json({ success: true, message: "Coupon added successfully" });
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

const getEditCoupon = async (req,res) => {
    try {
        const id = req.query.id;
        const coupons = await Coupons.findById(id);
        res.render("editCoupon",{coupons});
    } catch (error) {
        
    }
}

const postEditCoupon = async (req, res) => {
    try {
        const { couponCode, discountPercentage, minimumPrice, maximumPrice, createdDate, endDate } = req.body;
        const couponId = req.query.id;  // Access couponId from the query string
        console.log(couponId);

        // Validate the discount percentage as it maps to the "price" field in the schema
        const price = discountPercentage; // Assuming discountPercentage corresponds to "price"
        
        // Check if a coupon with the same code already exists (excluding the current one)
        const existingCoupon = await Coupons.findOne({
            code: couponCode,
            _id: { $ne: couponId },
        });

        if (existingCoupon) {
            return res.status(400).json({ error: "Coupon code already exists. Please choose a different code." });
        }

        // Prepare the fields to update based on the schema
        const updateFields = {
            code: couponCode,
            price: price,
            minimumAmount: minimumPrice,
            maximumAmount: maximumPrice,
            createdOn: new Date(createdDate), // Convert the string date into a Date object
            endOn: new Date(endDate), // Convert the string date into a Date object
        };

        // Update the coupon in the database
        const updatedCoupon = await Coupons.findByIdAndUpdate(couponId, updateFields, { new: true });

        if (!updatedCoupon) {
            return res.status(404).json({ error: "Coupon not found." });
        }

        // Redirect to the coupon list page or send a success message
        res.redirect('/admin/coupons');  // You can modify this as needed (redirect, success message, etc.)

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while updating the coupon." });
    }
};

module.exports = {
    getCouponPage,
    addCoupon,
    deleteCoupon,
    getEditCoupon,
    postEditCoupon,





}