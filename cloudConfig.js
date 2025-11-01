require('dotenv').config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "housify_dev",
    allowedFormats: ["jpg", "png", "jpeg", ], // supports promises as well ["webp", "mp4", "m4v", "mkv", "webm", "mov"]
  },
});

module.exports = {
    cloudinary,
    storage
}