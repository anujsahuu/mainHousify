const User = require("../models/user.js");

//Render signup form
module.exports.signupForm = (req, res) => {
    res.render("users/signup.ejs");
}

//Signup logic
module.exports.signup = async(req,res)=>{
try{
    let {username,email, password} = req.body;
    const newUser = new User({ email, username});
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err)=>{
        if(err){ 
            return next(err); 
        }
        req.flash("success", "Welcome to Housify!");
        res.redirect("/listings");
    }); 
} catch(e){
    req.flash("error", e.message);
    res.redirect("/signup");
}   
}

//Render login form
module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

//Logout logic
module.exports.logout = (req, res, next) => {
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/listings");
    });
}