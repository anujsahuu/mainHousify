const express = require("express");
const router = express.Router({ mergeParams: true });
const ejsMate = require("ejs-mate");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {reviewSchema } = require("../schema.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }   else {
            next();
        }
};

//review post
router.post("/", validateReview, wrapAsync(async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    listing.reviews.push(review);

    await review.save();
    await listing.save();
    req.flash("success", "Successfully added a review!");
    res.redirect(`/listings/${listing._id}`);
}));
 
router.delete("/:reviewId", wrapAsync(async (req,res,next)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});  //the $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;