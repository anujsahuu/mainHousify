const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URl = "mongodb://127.0.0.1:27017/housify";

connectToDatabase().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});

async function connectToDatabase() {
        await mongoose.connect(MONGO_URl);
}

const initDB = async () => {
    
        await Listing.deleteMany({});
        console.log("Existing listings cleared");
        initData.data = initData.data.map((obj) => ({...obj, owner:"69033a8414d78dd2f23d92b3"}));
        await Listing.insertMany(initData.data);
        console.log("Database initialized with new sample data"); 
};

initDB();