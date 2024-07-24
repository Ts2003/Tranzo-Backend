
const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const { Schema } = mongoose;

const userSchema = new Schema({
    googleId: {
        type: String,
        required: true
    }
});

userSchema.plugin(findOrCreate)

module.exports = mongoose.model('googleUser' , userSchema);


