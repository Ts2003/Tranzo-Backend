const mongoose = require("mongoose");
const { Schema } = mongoose;


const notificationSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60
    },
    message: {
        type: String,
        required: true
    },
    new: {
        type: Boolean,
        default: true
    },
});


module.exports = mongoose.model('notification' , notificationSchema);


