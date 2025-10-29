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
const listing = require("./routes/listing.js");
const review = require("./routes/review.js");
const MONGO_URl = "mongodb://127.0.0.1:27017/housify";
const router = require("express").Router();
const session = require("express-session"); 
const flash= require("connect-flash");

connectToDatabase().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

async function connectToDatabase() {
        await mongoose.connect(MONGO_URl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOptions = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//Home route
app.get("/", (req, res) => {
    res.send("Hello World"); }
);

app.use("/listings", listing); // Use the listing routes
app.use("/listings/:id/reviews" , review); // Use the review routes

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

