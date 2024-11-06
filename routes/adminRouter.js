const express = require('express');
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const {userAuth, adminAuth} = require("../middlewares/auth")
const cutomerController = require("../controllers/admin/cutomerController")

router.get("/pageerror",adminController.pageerror)
//login management
router.get("/login",adminController.loadLogin);
router.post("/login",adminController.login);
router.get("/",adminController.loadDashboard);
router.get("/dashboard",adminAuth,adminController.loadDashboard);
router.get("/logout",adminController.logout);

//customer management
router.get("/users",adminAuth,cutomerController.customerInfo)
router.get("/blockCustomer",adminAuth,cutomerController.customerBlocked)
router.get("/unblockCustomer",adminAuth,cutomerController.customerUnblocked)



module.exports = router;