const express = require('express');
const app = express();
const path = require('path');
const env = require("dotenv").config();
const session = require("express-session");
const passport = require("./config/passport")
const db = require("./config/db")
const userRouter = require("./routes/userRouter")
const adminRouter = require("./routes/adminRouter")
db()

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

app.use(passport.initialize());
app.use(passport.session());

//no cache control
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});


app.set("view engine","ejs");
app.set("views",[path.join(__dirname,"views/user"),path.join(__dirname,"views/admin")])

app.use(express.static(path.join(__dirname,"public")));

console.log(path.join(__dirname, "public"));
app.use(express.static(path.join(__dirname, "ChronoCraft-frontend")));
app.use(express.static(path.join(__dirname, "ChronoCraft-backend")));


app.use("/",userRouter);
app.use("/admin",adminRouter);

app.listen(process.env.PORT,()=>{
    console.log("Server running");
})

module.exports = app;


