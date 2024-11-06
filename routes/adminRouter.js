const express = require('express');
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const cutomerController = require("../controllers/admin/cutomerController")
const categoryController = require("../controllers/admin/categoryController")
const brandController = require("../controllers/admin/brandController");
const {userAuth, adminAuth} = require("../middlewares/auth")
const multer = require("multer")
const storage = require("../helpers/multer")
const uploads = multer({storage:storage});



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














module.exports = router;