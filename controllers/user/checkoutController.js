const Cart = require("../../models/cartSchema");
const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/ProductSchema");
const Coupon = require("../../models/couponSchema");
const Wallet = require("../../models/walletSchema");
const mongoose = require("mongoose");




const getCheckout = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId);
        const qty = parseInt(req.query.qty);



        if (!req.session.user) {
            return res.redirect('/login');
        }

        const wallet = await Wallet.findOne({ userId }); // Fetch wallet data
        const walletBalance = wallet?.balance || 0;
        
       
        const cart = await Cart.findOne({ userId: req.session.user }).populate('items.productId');
        const addresses = await Address.find({ userId: req.session.user });


        
        let totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        
        if (req.query.productId) {
            const product = await Product.findById(req.query.productId);
            if (!product) {
              return res.redirect('/pageNotFound');
            }
            totalAmount = product.salePrice * qty;
            return res.render('checkout', { cart: null, product, addresses, totalAmount, qty, walletData: { balance: walletBalance }  });
          } else {
            const cartItems = await Cart.findOne({ userId: user }).populate('items.productId');
            if (!cartItems) {
              return res.redirect('/cart');
            }
            totalAmount = cartItems.items.reduce((sum, item) => sum + item.totalPrice, 0);
            return res.render('checkout', { cart: cartItems, products: cartItems.items, addresses, totalAmount, product: null, walletData: { balance: walletBalance }  });
          }
       
    } catch (error) {
        console.error('Error loading checkout page:', error);
        res.status(500).send('Server Error');
    }
};

const placeOrder = async (req, res) => {
    try {
        const { addressId, payment_option, singleProduct, discountInput, couponCodeInput } = req.body;
        console.log("asad",req.body)

        const userId = req.session.user;
        if (!userId) return res.redirect('/login');

        const user = await User.findById(userId).populate('addresses');
        if (!user) return res.status(404).send("User not found");

        if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).send("Invalid address selected");
        }

        const cart = await Cart.findOne({ userId }).populate("items.productId");

        let totalPrice = 0;
        let orderedItems = [];

        const product = singleProduct ? JSON.parse(singleProduct) : null;
        
        if (product) {
            orderedItems.push({
                product: product._id,
                quantity: 1,
                price: product.salePrice,
            });
            totalPrice = req.body.totalPrice;
            await Product.findByIdAndUpdate(product._id, { $inc: { quantity: -1 } });
        } else if (cart && cart.items.length > 0) {
            orderedItems = cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.totalPrice / item.quantity,
            }));
            totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
            for (const item of cart.items) {
                await Product.findByIdAndUpdate(item.productId.id, { $inc: { quantity: -item.quantity } });
            }
        } else {
            return res.status(400).send("No products found to place an order");
        }
        console.log(totalPrice);

        let discount = isNaN(Number(discountInput)) || !discountInput ? 0 : Number(discountInput);
        let finalAmount = Number(totalPrice) - discount;

        const newOrder = new Order({
            orderedItems,
            user: userId,
            totalPrice,
            finalAmount,
            address: addressId,
            paymentMethod: payment_option,
            couponCode: couponCodeInput,
            discount,
            couponApplied: !!(couponCodeInput && discount),
            paymentStatus: payment_option === "wallet" ? "Completed" : "Pending",
        });

        if (payment_option === "wallet") {
            const wallet = await Wallet.findOne({ userId });
            if (!wallet || wallet.balance < finalAmount) {
                return res.status(400).send("Insufficient wallet balance.");
            }
            wallet.balance -= finalAmount;
            wallet.transactions.push({
                type: "debit",
                amount: finalAmount,
                description: "Purchase using wallet",
                orderId: newOrder._id,
            });
            await wallet.save();
        }


        if (payment_option === 'COD') {
            newOrder.status = 'Pending'; 
            newOrder.paymentStatus = 'Pending'; 
        } else if (payment_option === 'online') {
            newOrder.status = 'Pending';
            newOrder.paymentStatus = 'Pending'; 
        } else if (payment_option === 'wallet') {
            newOrder.status = 'Pending';
            newOrder.paymentStatus = 'Completed'; 
        }
        

        await newOrder.save();



        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ orderId: newOrder._id, finalAmount });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).send("Internal Server Error");
    }
};




module.exports = {
    getCheckout,
    placeOrder,
   
    
    
}

