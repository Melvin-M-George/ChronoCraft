const Cart = require("../../models/cartSchema");
const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Order = require("../../models/orderSchema");




const getCheckout = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId);
        // Check if the user is logged in
        if (!req.session.user) {
            // If the user is not logged in, redirect to the login page
            return res.redirect('/login');
        }
        
        // Fetch the user's cart data from the database
        const cart = await Cart.findOne({ userId: req.session.user }).populate('items.productId');
        const addresses = await Address.find({ userId: req.session.user });

        if (!cart || cart.items.length === 0) {
            // If the cart is empty, redirect to the cart page with a message
            return res.redirect('/cart');
        }

        // Calculate the cart total
        const totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Render the checkout page with cart and user data
        res.render('checkout', {
            cart:cart,
            pageTitle: 'Checkout',
            cartItems: cart.items,
            totalAmount,
            addresses,
            user: user, 
        },);
    } catch (error) {
        console.error('Error loading checkout page:', error);
        res.status(500).send('Server Error');
    }
};

const placeOrder = async (req, res) => {
    try {
        const { addressId, payment_option } = req.body;
        const userId = req.session.user;

        console.log(addressId);

        // Validate user session
        if (!userId) {
            console.log("User not logged in");
            return res.redirect('/login');
        }

        // Fetch user data
        const user = await User.findById(userId).populate('addresses');
        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        // Validate address
        const selectedAddress = user.addresses.filter(addr => addr._id.toString() === addressId);
        if (!selectedAddress) {
            console.log("Selected address not found");
            return res.status(400).send("Invalid address selected");
        }

        // Retrieve user's cart
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart || cart.items.length === 0) {
            console.log("Cart not found or empty");
            return res.redirect("/");
        }

        // Calculate totalPrice
        const totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        // Validate totalPrice
        if (isNaN(totalPrice)) {
            console.log("Invalid totalPrice:", totalPrice);
            return res.status(400).send("Invalid total price");
        }

        // Prepare order items
        const orderedItems = cart.items.map(item => {
            const price = item.totalPrice / item.quantity;

            if (isNaN(price)) {
                console.log("Invalid price for item:", item);
                return null; // Skip invalid items
            }

            return {
                product: item.productId,
                quantity: item.quantity,
                price,
            };
        }).filter(item => item !== null);

        // Create new order
        const newOrder = new Order({
            orderedItems,
            user: userId,
            totalPrice: totalPrice,
            finalAmount: totalPrice,
            address: addressId,
            paymentMethod: payment_option,
            status: payment_option === "COD" ? "Pending" : "Processing",
        });

        // Save order and clear cart
        await newOrder.save();
        cart.items = [];
        await cart.save();

        console.log("Order placed successfully:", newOrder);

        // Redirect or render success page
        res.render("orderConformation", { orderId: newOrder._id });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).send("Internal Server Error");
    }
};



module.exports = {
    getCheckout,
    placeOrder,
    
}

