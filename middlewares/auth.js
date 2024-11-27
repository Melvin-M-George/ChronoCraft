const User = require("../models/userSchema");

const userAuth = (req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data && !data.isBlocked){
                next();
            }else{
                res.redirect("/login")
            }
        })
        .catch(error=>{
            console.log("Error in user auth middleware");
            res.status(500).send("Internal Server error")
        })
    }else{
        res.redirect("/login")
    }
}



const adminAuth = async (req, res, next) => {
    if(req.session.admin){
        try {
            const admin = await User.findOne({ isAdmin: true });
            if (admin) {
                return next();
            } else {
                return res.redirect('/admin/login'); 
            }
        } catch (error) {
            console.log("Error in adminAuth Middleware", error);
            res.status(500).send("Internal Server Error"); 
        }
    }else{
        res.redirect("/admin/login")

    }
 
};

module.exports = {
    userAuth,
    adminAuth
}