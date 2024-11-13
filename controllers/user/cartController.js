const User = require("../../models/userSchema")
const Category = require("../../models/categorySchema");
const Product = require("../../models/ProductSchema");
const Cart = require("../../models/cartSchema");




const getCart = async (req,res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(userId);

        const cartItems = await Cart.findOne({ userId: userId }).populate('items.productId');

        if (!cartItems) {
            return res.render('cart', { cart: null, products: [], totalAmount: 0, user:user });
        }

        const totalAmount = cartItems.items.reduce((sum, item) => sum + item.totalPrice, 0);

        res.render('cart', { cart: cartItems, products: cartItems.items, totalAmount, user:user});
    } catch (error) {
        console.error(error);
        res.redirect('/page-not-found');
    }
}

module.exports = {
    getCart,

}