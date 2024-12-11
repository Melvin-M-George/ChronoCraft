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
            return res.status(401).json({ success: false, message: "Please login to add to cart" });
        }

        const productId = req.query.id;
        const quantity = parseInt(req.body.quantity) || 1;

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        const currentCartQuantity = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;

        if (currentCartQuantity + quantity > 5) {
            return res.status(400).json({ 
                success: false, 
                message: "Maximum quantity of 5 items per product allowed in cart" 
            });
        }

        if (currentCartQuantity + quantity > product.quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `${product.quantity - currentCartQuantity} items left in stock` 
            });
        }

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * product.salePrice;
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice,
                totalPrice: quantity * product.salePrice
            });
        }

        await cart.save();
        res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
};




const removeFromCart = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.redirect('/login');
        }

        const productId = req.query.id; 

        
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

       
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not in cart" });
        }

       
        cart.items.splice(itemIndex, 1); 

        
        await cart.save();

        
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
        

       //finding cart
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex === -1) return res.status(404).json({ success: false, message: "Product not in cart" });

       
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

       
        if (quantity > product.quantity) {
            return res.status(400).json({ success: false, message: "Exceeds available stock" });
        }

        
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].totalPrice = quantity * product.salePrice;

        
        await cart.save();


        const totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
        
        res.json({
            success: true,
            newTotalPrice: cart.items[itemIndex].totalPrice,
            totalCartAmount: totalAmount, 
        });
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




}