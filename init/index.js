const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config();
const dotenv = require("dotenv");

// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config(); // Load variables from .env for the script
// }
//const MONGO_URl = "mongodb://127.0.0.1:27017/housify";
const db_url = process.env.ATLAS_DB_URL;

connectToDatabase().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

async function connectToDatabase() {
        await mongoose.connect(db_url);
}

const initDB = async () => {
    
        await Listing.deleteMany({});
        console.log("Existing listings cleared");
        initData.data = initData.data.map((obj) => ({...obj, owner:"690d01e70ec0c575d8887cfa"}));
        await Listing.insertMany(initData.data);
        console.log("Database initialized with new sample data"); 
};

initDB();