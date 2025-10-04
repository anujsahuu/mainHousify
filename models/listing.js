const mongoose = require("mongoose");

const Schema= mongoose.Schema;

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    // required : true,// title must be a string and is mandatory
  },
  description: String,
  image: {
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvb2dsZSUyMGhvbWV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
      set: (v) => v === "" ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvb2dsZSUyMGhvbWV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60" : v,
    },
  },
  price:  Number,
  location : String,
  country : String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;