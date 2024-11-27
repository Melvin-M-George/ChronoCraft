const Category = require("../../models/categorySchema");
const Product = require("../../models/ProductSchema");
const User = require("../../models/userSchema");



const getShop = async (req,res) => {
    try {
        const user = req.session.user;
        
        const  categories = await Category.find({isListed:true});

        const selectedCategory = req.query.category;

        let productQuery = { isBlocked: false };
        if (selectedCategory) {
            productQuery.category = selectedCategory; 
        } else {
            productQuery.category = { $in: categories.map(category => category._id) };
        }

        let productData = await Product.find(productQuery);



        productData.sort((a,b)=>new Date(b.createdOn)-new Date(a.createdOn));
        productData = productData.slice(0);



        if (user) {
            const userData = await User.findOne({ _id: user._id });
            return res.render("shop", { user: userData ,products:productData,categories, selectedCategory});
        } else {
            return res.render("shop", {products:productData , categories, selectedCategory}); 
        }
    } catch (error) {
        console.error("Error loading shop page",error);
        return res.status(500).send("Server error");
    }

}

module.exports = {
    getShop
}