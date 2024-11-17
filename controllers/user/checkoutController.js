const Cart = require("../../models/cartSchema");
const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/ProductSchema");




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

    

        // Calculate the cart total
        let totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Render the checkout page 
        if (req.query.id) {
            const product = await Product.findById(req.query.id);
            console.log(product);
            if (!product) {
              return res.redirect('/pageNotFound');
            }
            totalAmount = product.salePrice;
            return res.render('checkout', { cart: null, product, addresses, totalAmount });
          } else {
            const cartItems = await Cart.findOne({ userId: user }).populate('items.productId');
            if (!cartItems) {
              return res.render('checkout', { cart: null, products: [], addresses, totalAmount, product: null });
            }
            totalAmount = cartItems.items.reduce((sum, item) => sum + item.totalPrice, 0);
            return res.render('checkout', { cart: cartItems, products: cartItems.items, addresses, totalAmount, product: null });
          }
       
    } catch (error) {
        console.error('Error loading checkout page:', error);
        res.status(500).send('Server Error');
    }
};

const placeOrder = async (req, res) => {
    try {
        const { addressId, payment_option, singleProduct } = req.body;
        const userId = req.session.user;


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

        // Calculate totalPrice
        let totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        // Validate totalPrice
        if (isNaN(totalPrice)) {
            console.log("Invalid totalPrice:", totalPrice);
            return res.status(400).send("Invalid total price");
        }
        
        let orderedItems = [];
        if (singleProduct) {
            const product = JSON.parse(singleProduct);
            console.log(product.salePrice);
            orderedItems.push({
                product: product._id,
                quantity: 1,
                price: product.salePrice,
            });
            totalPrice = product.salePrice;
            await Product.findByIdAndUpdate(product._id, {
              $inc: { quantity: -1 }
          });
          
        } else if (cart) {
            const cartItems = cart.items;
            console.log(cartItems);
            orderedItems = cartItems.map(item => ({
                product: item._id,
                quantity: item.quantity,
                price: item.totalPrice / item.quantity,
            }));
            cartItems.forEach(async item=>{
              await Product.findByIdAndUpdate(item.productId.id,{
                $inc:{quantity:-item.quantity}
              })
            })
        }

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
        // cartItems.forEach(async item=>{
        //     await Product.findByIdAndUpdate(item.productId,{
        //       $inc:{quantity:-item.quantity}
        //     })
        //   })
        cart.items = [];
        await cart.save();

        console.log("Order placed successfully:", newOrder);

        // Redirect or render success page
        res.render("orderConfirmation",{orderId:newOrder._id});
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).send("Internal Server Error");
    }
};




module.exports = {
    getCheckout,
    placeOrder,
   
    
    
}

