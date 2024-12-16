const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require("../controllers/user/userController");
const profileController = require("../controllers/user/profileController"); 
const {userAuth, adminAuth} = require("../middlewares/auth");
const cartController = require("../controllers/user/cartController");
const checkoutController = require("../controllers/user/checkoutController");
const orderController = require("../controllers/user/orderController");
const couponController = require("../controllers/user/couponController");
const wishlistController = require("../controllers/user/wishlistController");
const paymentController = require("../controllers/user/paymentController");
const walletController = require("../controllers/user/walletController");
const shopController = require("../controllers/user/shopController");
const invoiceController = require("../controllers/user/invoiceController");
const User = require("../models/userSchema");
const Cart = require("../models/cartSchema");
const Wishlist = require("../models/wishlistSchema");




router.use(async (req, res, next) => {
    try {
        const userId = req.session.user;
        let cartlen = 0; 
        let wishlistlen = 0;

        if (userId) {
            const userData = await User.findById(userId);
            const cart = await Cart.findOne({ userId });
            const wishlist = await Wishlist.findOne({userId});
            if(wishlist && wishlist.products){
                wishlistlen = wishlist.products.length;                                                               
            }
            if (cart && cart.items) {
                cartlen = cart.items.length;
            }

            res.locals.user = userData || null; 
        } else {
            res.locals.user = null;
        }

        res.locals.cartlen = cartlen;
        res.locals.wishlistlen = wishlistlen; 
        next();
    } catch (error) {
        console.error("Error in middleware:", error);
        next(error); 
    }
});

//Handle blocked users

router.use(async (req, res, next) => {
    if (req.path === "/login") {
        return next();
    }

    if (req.session.user) {
        const user = await User.findById(req.session.user._id);
        if (user && user.isBlocked) {
            return res.redirect("/login");
        } else if (user) {

            return next();
        }
    }
    next();
});

//Header Badge count
router.get("/headerBadgeCount",userAuth,userController.headerBadgeCount);

//Error management
router.get("/pageNotFound",userController.pageNotFound)

//sign up
router.get("/signup",userController.loadSignup);
router.post("/signup",userController.signup);
router.post("/verify-otp",userController.verifyOtp);
router.post("/resend-otp",userController.resendOtp);
router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));
router.get("/google/callback",passport.authenticate("google",{failureRedirect:"/signup"}),(req,res)=>{
    req.session.user = req.user;
    res.redirect("/")
});

//Login
router.get("/login",userController.loadLogin);
router.post("/login",userController.login);

//Home page and Logout
router.get("/",userController.loadHomepage);
router.get("/logout",userController.logout);
router.get("/productDetails",userController.getProductDetails);
router.get("/sortAndFilterProducts",userController.sortAndFilterProducts);

//Profile management
router.get("/forgot-password",profileController.getForgotPassPage);
router.post("/forgot-email-valid",profileController.forgotEmailValid);
router.post("/verify-passForgot-otp",profileController.verifyForgotPassOtp);
router.get("/reset-password",profileController.getResetPassPage);
router.post("/resend-forgot-otp",profileController.resendOtp);
router.post("/reset-password",profileController.postNewPassword);



router.get("/userProfile",userAuth,profileController.userProfile);
router.get("/changePassword",userAuth,profileController.changePassword);
router.post("/changePassword",userAuth,profileController.changePasswordValid);
router.post("/verify-changepassword-otp",userAuth,profileController.verifyChangePassOtp);
router.get("/editProfile",userAuth,profileController.getEditProfile);
router.post("/updateProfile",userAuth,profileController.UpdateProfile);

//Address management
router.get("/addAddress",userAuth,profileController.addAddress);
router.post("/addAddress",userAuth,profileController.postAddAddress);
router.get("/editAddress",userAuth,profileController.editAddress);
router.post("/editAddress",userAuth,profileController.postEditAddress);
router.get("/deleteAddress",userAuth,profileController.deleteAddress);

//cart management
router.get("/cart",userAuth,cartController.getCart);
router.post("/addToCart",userAuth,cartController.addToCart);
router.get('/removeFromCart',userAuth,cartController.removeFromCart);
router.post('/updateQuantity',userAuth,cartController.updateCartQuantity);

//order management
router.get("/orderDetails",userAuth,orderController.getIndividualOrderDetails)
router.get("/invoiceDownload",userAuth,invoiceController.invoiceDownload);
router.post("/cancelOrder",userAuth,orderController.cancelOrder);
router.post("/returnRequest",userAuth,orderController.returnOrder);
router.get("/orderConfirmation",userAuth,orderController.getOrderConfimation);


//Checkout management
router.get("/checkout",userAuth,checkoutController.getCheckout);
router.post("/placeOrder",userAuth,checkoutController.placeOrder);


//coupon management
router.get("/couponList",userAuth,couponController.getCouponList);
router.post('/applyCoupon',userAuth,couponController.applyCoupon);

//wishlist management
router.get("/wishlist",userAuth,wishlistController.getWishList);
router.get("/addToWishlist",userAuth,wishlistController.addToWishlist);
router.post("/removeFromWishlist",userAuth,wishlistController.removeFromWishlist);


//Razorpay Payment
router.post("/createPayment",userAuth,paymentController.createRazorpay);
router.post('/updateOrder',userAuth,paymentController.updateOrder);
router.get('/retryPayment',userAuth,paymentController.retryPayment);
//Wallet
router.get("/wallet",userAuth,walletController.getWallet);

//shop management
router.get("/shop",shopController.getShop);




module.exports = router;