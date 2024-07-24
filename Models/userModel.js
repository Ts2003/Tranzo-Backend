const mongoose = require("mongoose");
const { Schema } = mongoose;
const findOrCreate = require('mongoose-findorcreate');


const userSchema = new Schema({
    name:{
        type: String,
        default: '',
    },
    email:{
        type: String,
        unique: true,
    },
    googleId: {
        type: String,
    },
    password:{
        type: String,
    },
    resetToken:{
        type: String,
        default: undefined
    },
    resetTokenExpiration:{
        type: Date,
        default: undefined
    },
    sentRequest:[{
        name: {type: String},
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    }],
    recievedRequest: [{
        name: {type: String},
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        date: { type: Date, default: Date.now }
    }],
    friendsList: [{
        name: {type: String},
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    }],
    chats: [{
        name: {type: String},
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    }],
    newNotifications: [{
        name: {type: String}
    }],
    profile_image: {
        type: String,
        default: ''
    },
    groups: [{
        id: {
            type: mongoose.Schema.Types.ObjectId, ref: 'group',
        },
        name: {
            type: String
        },
        numberOfMembers: {
            type: Number
        },
        profile_image: {
            type: String,
            default: ''
        }
    }]
});

userSchema.plugin(findOrCreate)

module.exports = mongoose.model('user' , userSchema);



