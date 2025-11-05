const express = require("express");
const router = express.Router({mergeParams: true});
const ejsMate = require("ejs-mate");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const Listing = require("../models/listing.js");
const { listingSchema,reviewSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const { validateListing } = require("../middleware.js");
const listingsController = require("../controllers/listings.js")
const multer  = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage: storage});

//List all listings and create new listing
router
    .route("/")
    .get( wrapAsync(listingsController.listings))
    .post(
        isLoggedIn,
        upload.single("listing[image]"), 
        validateListing, 
        wrapAsync(listingsController.createListing));
    

//Form to create new listing
router.get("/new", isLoggedIn, listingsController.renderNewForm);

//Terms and Conditions Page
router.get("/tnc", listingsController.tnc);

//Form to edit listing
router.get("/:id/edit", isLoggedIn,isOwner, listingsController.renderEditForm );

router
    .route("/:id")
    .get( wrapAsync(listingsController.showListing)) //Show individual listing details
    .put( isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingsController.updateListing)) //Update listing
    .delete( isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing)); //Delete listing

module.exports = router;