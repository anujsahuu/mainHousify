const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async(req,res)=>{
try{
    let {username,email, password} = req.body;
    const newUser = new User({ email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.flash("success", "Welcome to Housify!");
    res.redirect("/listings");
} catch(e){
    req.flash("error", e.message);
    res.redirect("/signup");
}
    
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", 
    saveRedirectUrl,
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), 
    async (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/listings";
    delete req.session.returnTo;
    if(!res.locals.redirectUrl){
        return res.redirect(redirectUrl);
    }
    res.redirect(res.locals.redirectUrl);
});

router.get("/logout", (req, res, next) => {
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
});

module.exports = router;