const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require("../controllers/user/userController");
const profileController = require("../controllers/user/profileController"); 
const {userAuth, adminAuth} = require("../middlewares/auth");
const cartController = require("../controllers/user/cartController");


//Error management
router.get("/pageNotFound",userController.pageNotFound)

//sign up
router.get("/signup",userController.loadSignup);
router.post("/signup",userController.signup);
router.post("/verify-otp",userController.verifyOtp);
router.post("/resend-otp",userController.resendOtp);
router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));
router.get("/google/callback",passport.authenticate("google",{failureRedirect:"/signup"}),(req,res)=>{res.redirect("/")});

//Login
router.get("/login",userController.loadLogin);
router.post("/login",userController.login);

//Home page and Logout
router.get("/",userController.loadHomepage);
router.get("/logout",userController.logout);
router.get("/productDetails",userController.getProductDetails);

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

//Address management
router.get("/addAddress",userAuth,profileController.addAddress);
router.post("/addAddress",userAuth,profileController.postAddAddress);
router.get("/editAddress",userAuth,profileController.editAddress);
router.post("/editAddress",userAuth,profileController.postEditAddress);
router.get("/deleteAddress",userAuth,profileController.deleteAddress);

//cart management
router.get("/cart",cartController.getCart);
router.get("/addToCart",cartController.addToCart);
router.get('/removeFromCart', cartController.removeFromCart);
router.post('/updateQuantity', cartController.updateCartQuantity);




module.exports = router;