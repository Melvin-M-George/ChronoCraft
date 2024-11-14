const Cart = require("../../models/cartSchema");



const getCheckout = async (req, res) => {
    try {
        // Fetch the user's cart data from the database
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            // If the cart is empty, redirect to the cart page with a message
            return res.redirect('/cart');
        }

        // Calculate the cart total
        const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Render the checkout page with cart and user data
        res.render('checkout', {
            pageTitle: 'Checkout',
            cartItems: cart.items,
            cartTotal,
            user: req.user, // Pass the user's details if needed for billing information
        });
    } catch (error) {
        console.error('Error loading checkout page:', error);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getCheckout,
    
}

