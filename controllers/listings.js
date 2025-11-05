const Listing = require("../models/listing");
const listingSchema = require("../schema.js").listingSchema;

//Main Page - List all listings
module.exports.listings = async (req,res)=>{
   const allListings =  await Listing.find({});
   res.render("listings/index.ejs", {listings: allListings});
}

//Form to create new listing
module.exports.renderNewForm = (req,res)=>{
   res.render("listings/new.ejs");
}

module.exports.tnc = (req,res)=>{
    res.render("listings/tnc.ejs");
}

 //Form to edit listing
module.exports.renderEditForm = async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);

    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    //https://res.cloudinary.com/demo/image/upload/ar_1.0,c_fill,h_250/bo_5px_solid_lightblue/leather_bag_gray.jpg
    originalImageUrl = originalImageUrl.replace("/upload","/upload/ar_1.0,c_fill,h_250/bo_5px_solid_rgb:D2C4FB");

    res.render("listings/edit.ejs", {listing, originalImageUrl});
}

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
module.exports.showListing = async (req,res)=>{
    const {id} = req.params;
   const listing =  await Listing.findById(id)
   .populate({path: "reviews", 
    populate:({path:"author"})})
   .populate("owner");
   console.log(listing);
   res.render("listings/show.ejs", {listing, getStarRatingHTML});
}

//Create new listing
module.exports.createListing = async (req,res)=>{
    const url = req.file.path;
    const filename = req.file.filename;
    
   let result = listingSchema.validate(req.body);

   if(result.error){
        throw new ExpressError(400, result.err);

   }

    // Extract the listing data from the request body
    const newListingData = req.body.listing;
    // const newImageUrl = req.body.listing.image; 
    // // If an image URL is provided, set it
    // if (newImageUrl) {
    //     newListingData.image = { url: newImageUrl };
    // }

    // Convert price to a number
    newListingData.price = parseFloat(newListingData.price); 

    // Create a new listing instance
    const newListing = new Listing(newListingData);
    newListing.image = { url: url, filename: filename};
    // Set the owner of the listing to the currently logged-in user
    newListing.owner = req.user._id;

    // Save the listing to the database
    await newListing.save(); 
    req.flash("success", "Successfully created a new listing!");
    res.redirect(`/listings/${newListing._id}`);
    }

//update listing
module.exports.updateListing = async (req,res)=>{
    const { id } = req.params;

    // 3. Update all simple fields (title, price, description, etc.)
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
        const url = req.file.path;
        const filename = req.file.filename;

        listing.image = { url: url, filename: filename};
        
        // 5. Save the document to apply the nested change (important!)
        await listing.save();
    }
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${listing._id}`);

}

//delete listing
module.exports.deleteListing = async (req,res)=>{
    const {id} = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}