const express = require("express");
const router = express.Router();
const ejsMate = require("ejs-mate");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const Listing = require("../models/listing.js");
const { listingSchema,reviewSchema } = require("../schema.js");


//Middleware to validate listing data using Joi schema
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }   else {
            next();
        }
};

//Main Page - List all listings
router.get("/", async (req,res)=>{
   const allListings =  await Listing.find({});
   res.render("listings/index.ejs", {listings: allListings});
});

//Form to create new listing
router.get("/new", (req,res)=>{
   res.render("listings/new.ejs");
});

//Terms and Conditions Page
router.get("/tnc", (req,res)=>{
    res.render("listings/tnc.ejs");
 });

 //Form to edit listing
router.get("/:id/edit", async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

function getStarRatingHTML(rating) {
    let stars = '';
    const maxStars = 5;
    
    // Add filled stars
    for (let i = 0; i < rating; i++) {
        stars += '<i class="fa-solid fa-star ratingStar" style="font-size:small"></i>';
    }
    
    // Add empty stars
    for (let i = rating; i < maxStars; i++) {
        stars += '<i class="fa-regular fa-star ratingStar" style="font-size:small"></i>';
    }
    
    return stars;
}

//Show individual listing details
router.get("/:id", wrapAsync(async (req,res)=>{
    const {id} = req.params;
   const listing =  await Listing.findById(id).populate("reviews");
   res.render("listings/show.ejs", {listing, getStarRatingHTML});
}));

//Create new listing
router.post("/", wrapAsync(async (req,res)=>{
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
router.put("/:id",validateListing, wrapAsync(async (req,res)=>{
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
router.delete("/:id", wrapAsync(async (req,res)=>{
    const {id} = req.params;

    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;