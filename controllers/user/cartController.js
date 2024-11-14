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

        const cartItems = await Cart.findOne({ userId: userId }).populate('items.productId','productName productImages salePrice');

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


const addToCart = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.redirect('/login');
        }

        const productId = req.query.id;
        const quantity = parseInt(req.body.quantity) || 1;
        
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));

        if (itemIndex > -1) {
            // Update quantity and total price for existing item
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * product.salePrice;
        } else {
            // Add new item with price and totalPrice fields
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice, // Adding price per unit
                totalPrice: quantity * product.salePrice
            });
        }

        await cart.save();
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.redirect('/login');
        }

        const productId = req.query.id; // Get product ID from query parameter

        // Find the user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find the index of the product to remove
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not in cart" });
        }

        // Remove the product from the cart
        cart.items.splice(itemIndex, 1);

        // Save the updated cart
        await cart.save();

        // Redirect back to the cart page
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while removing the product" });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.session.user;
        

        // Find the cart
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        // Find the item in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex === -1) return res.status(404).json({ success: false, message: "Product not in cart" });

        // Find the product
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        // Ensure quantity does not exceed stock
        if (quantity > product.quantity) {
            return res.status(400).json({ success: false, message: "Exceeds available stock" });
        }

        // Update cart item quantity and total price
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].totalPrice = quantity * product.salePrice;

        // Save the updated cart
        await cart.save();

        // Send the new total price as part of the response
        res.json({ success: true, newTotalPrice: cart.items[itemIndex].totalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating quantity" });
    }
};


module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
};


module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,




}