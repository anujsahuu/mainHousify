const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


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

//Show individual listing details
app.get("/listings/:id", async (req,res)=>{
    const {id} = req.params;
   const listing =  await Listing.findById(id);
   res.render("listings/show.ejs", {listing});
});



//Create new listing
app.post("/listings", async (req,res)=>{
    try{
        const newListingData = req.body.listing; 

    // Convert price to a number
    newListingData.price = parseFloat(newListingData.price); 

    // Create a new listing instance
    const newListing = new Listing(newListingData);
    console.log(newListing);

    // Save the listing to the database
    await newListing.save(); 
    res.redirect(`/listings/${newListing._id}`);
    }catch(err){
        next(err);
    }
});

//Form to edit listing
app.get("/listings/:id/edit", async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

//update listing
app.put("/listings/:id", async (req,res)=>{
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

});

//delete listing
app.delete("/listings/:id", async (req,res)=>{
    const {id} = req.params;

    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

// app.get("/testlistings", async (req, res) => {
//     let sampleListings = new Listing({
//         title: "John Doe",
//         description: "A beautiful apartment in the city center.",
//         price: 1200,
//         location: "New York",
//         country: "USA"
//     });

//     await sampleListings.save();
//     console.log("Sample listing saved to database");
//     res.send("Sample listing created and saved to database");
// });

app.use((err, req, res, next) => {
    res.send("Something went wrong" );
});

app.listen(8080, () => {
    console.log("Server is running on port 8080"); }
);