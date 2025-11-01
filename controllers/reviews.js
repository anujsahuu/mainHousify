const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    console.log(review);
    listing.reviews.push(review);

    await review.save();
    await listing.save();
    req.flash("success", "Successfully added a review!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async (req,res,next)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});  //the $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}