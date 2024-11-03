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



module.exports = {
    loadHomepage,
    pageNotFound,
    loadSignup,
    loadLogin,
}