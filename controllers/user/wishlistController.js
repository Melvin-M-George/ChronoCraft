const Wishlist = require("../../models/wishlistSchema");
const Product = require("../../models/ProductSchema");
const { render } = require("ejs");



const getWishList = async (req,res) => {
    try {

        const userId = req.session.user;
        if(!userId){
            return res.redirect("/login");
        }
        const wishlistdoc = await Wishlist.findOne({userId:userId}).populate("products.productId") || [];
        if(wishlistdoc){
            return res.render("wishlist",{products:wishlistdoc.products})
        }else{
            return res.render("wishlist",{products:[]})
        }
    } catch (error) {
        console.error("Error loading wishlist",error);
        res.redirect("/pageNotFound");
    }
}


const addToWishlist = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Please login to add to wishlist" });
        }

        let wishlistdoc = await Wishlist.findOne({ userId });

        if (wishlistdoc) {
            const productExisting = wishlistdoc.products.some(item => item.productId.toString() === productId);

            if (!productExisting) {
                wishlistdoc.products.push({ productId });
                await wishlistdoc.save();
            } else {
                return res.json({ success: false, message: "Product already in wishlist" });
            }
        } else {
            wishlistdoc = new Wishlist({
                userId,
                products: [{ productId }],
            });
            await wishlistdoc.save();
        }

        res.json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
        console.error("Error adding to wishlist", error);
        res.status(500).json({ success: false, message: "Failed to add product to wishlist" });
    }
};



const removeFromWishlist  = async (req,res) => {
    try {
        
        const userId = req.session.user._id;
        const {productId} = req.body;

        await Wishlist.findOneAndUpdate(
            {userId:userId},
            {$pull:{products:{productId}}}
        )

        res.redirect("/wishlist")

    } catch (error) {
        console.error("Error removing product from wishlist",error);
        res.status(500).send("Failed to remove product from the wishlist");
    }
}






module.exports = {
    getWishList,
    addToWishlist,
    removeFromWishlist,
    


}