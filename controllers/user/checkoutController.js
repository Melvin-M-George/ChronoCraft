const Cart = require("../../models/cartSchema");
const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/ProductSchema");
const Coupon = require("../../models/couponSchema");
const mongoose = require("mongoose");




const getCheckout = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId);
        const qty = parseInt(req.query.qty);



        if (!req.session.user) {
            return res.redirect('/login');
        }
        
       
        const cart = await Cart.findOne({ userId: req.session.user }).populate('items.productId');
        const addresses = await Address.find({ userId: req.session.user });

        if (!cart || cart.items.length === 0) {
            return res.redirect('/cart'); // Redirect to the cart page
        }

        
        let totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        
        if (req.query.productId) {
            const product = await Product.findById(req.query.productId);
            console.log(product);
            if (!product) {
              return res.redirect('/pageNotFound');
            }
            totalAmount = product.salePrice * qty;
            return res.render('checkout', { cart: null, product, addresses, totalAmount, qty });
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
        const { addressId, payment_option, singleProduct,discountInput,couponCodeInput } = req.body;
        const userId = req.session.user;


        
        if (!userId) {
            console.log("User not logged in");
            return res.redirect('/login');
        }

       
        const user = await User.findById(userId).populate('addresses');
        if (!user) {
            console.log("User not found");
            return res.status(404).send("User not found");
        }

        if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
            console.error("Invalid or missing addressId:", addressId);
            return res.status(400).send("Invalid address selected");
        }
        
        
        const selectedAddress = user.addresses.filter(addr => addr._id.toString() === addressId);
        if (!selectedAddress) {
            console.log("Selected address not found");
            return res.status(400).send("Invalid address selected");
        }

        
        const cart = await Cart.findOne({ userId }).populate("items.productId");

        
        let totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        
        if (isNaN(totalPrice)) {
            console.log("Invalid totalPrice:", totalPrice);
            return res.status(400).send("Invalid total price");
        }
        
        let orderedItems = [];
        if (singleProduct) {
            const product = JSON.parse(singleProduct);
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
            orderedItems = cartItems.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.totalPrice / item.quantity,
            }));
            cartItems.forEach(async item=>{
              await Product.findByIdAndUpdate(item.productId.id,{
                $inc:{quantity:-item.quantity}
              })
            })
        }

        let finalAmount = totalPrice-discountInput;
        
        const newOrder = new Order({
            orderedItems,
            user: userId,
            totalPrice: totalPrice,
            finalAmount: finalAmount,
            address: addressId,
            paymentMethod: payment_option,
            couponCode:couponCodeInput,
            discount:discountInput,
            couponApplied: Boolean(couponCodeInput && discountInput),
            paymentStatus: "Pending",
        });

       
        await newOrder.save();
       
        cart.items = [];
        await cart.save();

        
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

