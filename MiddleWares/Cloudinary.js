
require('dotenv').config()
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_KEY,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET
})

console.log("Connection to Cloudinary is successful")

module.exports = cloudinary


