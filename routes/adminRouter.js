const express = require('express');
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const cutomerController = require("../controllers/admin/cutomerController")
const categoryController = require("../controllers/admin/categoryController")
const brandController = require("../controllers/admin/brandController");
const productController = require("../controllers/admin/productController");
const stockController = require("../controllers/admin/stockController");
const orderController = require("../controllers/admin/orderController");
const couponController = require("../controllers/admin/couponController");
const {adminAuth} = require("../middlewares/auth")
const multer = require("multer")
const storage = require("../helpers/multer")
const uploads = multer({storage:storage});


//Error management
router.get("/pageerror",adminController.pageerror)

//login management
router.get("/login",adminController.loadLogin);
router.post("/login",adminController.login);
router.get("/",adminAuth,adminController.loadDashboard);
router.get("/dashboard",adminAuth,adminController.loadDashboard);
router.get("/logout",adminController.logout);



//customer management
router.get("/customers",adminAuth,cutomerController.customerInfo)
router.get("/blockCustomer",adminAuth,cutomerController.customerBlocked)
router.get("/unblockCustomer",adminAuth,cutomerController.customerUnblocked)

//category management
router.get("/category",adminAuth,categoryController.categoryInfo)
router.post("/addCategory",adminAuth,categoryController.addCategory);
router.post("/addCategoryOffer",adminAuth,categoryController.addCategoryOffer);
router.post("/removeCategoryOffer",adminAuth,categoryController.removeCategoryOffer);
router.get("/listCategory",adminAuth,categoryController.getListCategory);
router.get("/unlistCategory",adminAuth,categoryController.getUnlistCategory);
router.get("/editCategory",adminAuth,categoryController.getEditCategory);
router.post("/editCategory/:id",adminAuth,categoryController.editCategory);

//Brand Management
router.get("/brands",adminAuth,brandController.getBrandPage);
router.post("/addBrand",adminAuth,uploads.single("image"),brandController.addBrand);
router.get("/blockBrand",adminAuth,brandController.blockBrand);
router.get("/unBlockBrand",adminAuth,brandController.unBlockBrand);
router.get("/deleteBrand",adminAuth,brandController.deleteBrand);

//Product Management
router.get("/addProducts",adminAuth,productController.getProductAddPage);
router.post("/addProducts",adminAuth,uploads.array("images",4),productController.addProducts);
router.get("/products",adminAuth,productController.getAllProducts);
router.post("/addProductOffer",adminAuth,productController.addProductOffer);
router.post("/removeProductOffer",adminAuth,productController.removeProductOffer);
router.get("/blockProduct",adminAuth,productController.blockProduct);
router.get("/unblockProduct",adminAuth,productController.unblockProduct);  
router.get("/editProduct",adminAuth,productController.getEditProduct);
router.post("/editProduct/:id",adminAuth,uploads.array("images",4),productController.editProduct);
router.post("/deleteImage",adminAuth,productController.deleteSingleImage);

//stock management
router.get('/stock',adminAuth,stockController.getStocks);
router.post('/updateStock',adminAuth,stockController.updateStock);


//Order Mangement
router.get("/orders",adminAuth,orderController.getOrders);
router.post("/updateOrderStatus",adminAuth,orderController.updateOrderStatus);

//coupon management
router.get("/coupons",adminAuth,couponController.getCouponPage);
router.post("/addCoupon",adminAuth,couponController.addCoupon);
router.get("/deleteCoupon",adminAuth,couponController.deleteCoupon);


module.exports = router;