const User = require("../../models/userSchema")


const loadHomepage = async (req,res)=>{
    try {
        console.log("home page")
        return res.render("home")
    } catch (error) {
        console.log("Home page not found");
        res.status(500).send("Server error");
    }
}

const pageNotFound = async (req,res)=>{
    try {
        res.render("page-404")
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}

const loadSignup = async (req,res) => {
    try {
        return res.render("signup");
    } catch (error) {
        console.log("Sign up page is not loading: ",error);
        res.status(500).send("Server error")
    }
}
const loadLogin = async (req,res) => {
    try {
        return res.render("login");
    } catch (error) {
        console.log("Login page is not loading: ",error);
        res.status(500).send("Server error")
    }
}

const signup = async (req,res) => {
    const {name,email,phone,password} = req.body;
    try {
        const newUser = new User({name,email,phone,password})
        await newUser.save();
        return res.redirect("/signup");
    } catch (error) {
        console.error("Error for save user",error);
        res.status(500).send("Internal server error")
    }
}



module.exports = {
    loadHomepage,
    pageNotFound,
    loadSignup,
    loadLogin,
    signup,
}