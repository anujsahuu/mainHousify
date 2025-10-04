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
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URl = "mongodb://127.0.0.1:27017/housify";

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

//Middleware to validate listing data using Joi schema
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }   else {
            next();
        }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }   else {
            next();
        }
};

//Home route
app.get("/", (req, res) => {
    res.send("Hello World"); }
);

//Main Page - List all listings
app.get("/listings", async (req,res)=>{
   const allListings =  await Listing.find({});
   res.render("listings/index.ejs", {listings: allListings});
});

//Form to create new listing
app.get("/listings/new", (req,res)=>{
   res.render("listings/new.ejs");
});

//Terms and Conditions Page
app.get("/listings/tnc", (req,res)=>{
    res.render("listings/tnc.ejs");
 });

 //Form to edit listing
app.get("/listings/:id/edit", async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

function getStarRatingHTML(rating) {
    let stars = '';
    const maxStars = 5;
    
    // Add filled stars
    for (let i = 0; i < rating; i++) {
        stars += '<i class="fa-solid fa-star ratingStar"></i>';
    }
    
    // Add empty stars
    for (let i = rating; i < maxStars; i++) {
        stars += '<i class="fa-regular fa-star ratingStar"></i>';
    }
    
    return stars;
}

//Show individual listing details
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    const {id} = req.params;
   const listing =  await Listing.findById(id).populate("reviews");
   res.render("listings/show.ejs", {listing, getStarRatingHTML});
}));

//Create new listing
app.post("/listings", wrapAsync(async (req,res)=>{
   let result = listingSchema.validate(req.body);

   if(result.error){
        throw new ExpressError(400, result.err);
   }

    // Extract the listing data from the request body
    const newListingData = req.body.listing; 

    // Convert price to a number
    newListingData.price = parseFloat(newListingData.price); 

    // Create a new listing instance
    const newListing = new Listing(newListingData);
    console.log(newListing);

    // Save the listing to the database
    await newListing.save(); 
    res.redirect(`/listings/${newListing._id}`);
    })
);

//update listing
app.put("/listings/:id",validateListing, wrapAsync(async (req,res)=>{
    const { id } = req.params;
    
    // 1. Extract the image URL submitted by the corrected form: listing[image][url]
    const newImageUrl = req.body.listing.image.url;
    
    // 2. Remove the image data from the main body object to prevent Mongoose from trying to overwrite the whole object
    delete req.body.listing.image; 

    // 3. Update all simple fields (title, price, description, etc.)
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // 4. Manually update the nested image.url field if a value was submitted
    if (newImageUrl) {
        // Since you removed the image object in step 2, Mongoose loaded the old listing.
        // We now safely update ONLY the URL on the loaded document.
        listing.image.url = newImageUrl;
    }
    
    // 5. Save the document to apply the nested change (important!)
    await listing.save();
    res.redirect(`/listings/${listing._id}`);

}));

//delete listing
app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    const {id} = req.params;

    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//review post
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    listing.reviews.push(review);

    await review.save();
    await listing.save();
    
    res.redirect(`/listings/${listing._id}`);
}));

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

