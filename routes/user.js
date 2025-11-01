const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl} = require("../middleware.js");
const usersController = require("../controllers/users.js");

router.route("/signup")
    .get (usersController.signupForm ) //Render signup form
    .post( wrapAsync(usersController.signup)); //Handle signup logic

router.route("/login")
    .get( usersController.loginForm ) //Render login form
    .post( saveRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), usersController.login ); //Handle login logic

//Logout route
router.get("/logout", usersController.logout );

module.exports = router;