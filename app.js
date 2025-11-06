require("dotenv").config();
const dotenv = require("dotenv");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URl = "mongodb://127.0.0.1:27017/housify";
const db_url = process.env.ATLAS_DB_URL;

const router = require("express").Router();
const session = require("express-session"); 
const MongoStore = require('connect-mongo');
const flash= require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

connectToDatabase().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

async function connectToDatabase() {
        await mongoose.connect(db_url);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOptions = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    }
}

const store = MongoStore.create({
    mongoUrl: db_url,
    crypto : {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//success and error flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.use("/listings", listingRouter); // Use the listing routes
app.use("/listings/:id/reviews" , reviewRouter); // Use the review routes
app.use("/", userRouter); // Use the user routes

//Handle all other routes - 404 Not Found
app.all("/:pathMatch", (req,res,next)=> {
    next(new ExpressError( 404, "Page Not Found!"));
})

//Generic Error Handler
app.use((err, req, res, next) => {
    let {statusCode = 500,message = "Something Went Wrong!"} = err;
    res.status(statusCode).render("error.ejs", {err});
});

app.listen(8080, () => {
    console.log("Server is running on port 8080"); }
);

