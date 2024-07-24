
const mongoose = require("mongoose");
const { Schema } = mongoose;


const groupSchema = new Schema({
    name:{
        type: String,
    },
    members: [{
        id: {
            type: mongoose.Schema.Types.ObjectId, ref: 'user',
        },
        name: {
            type: String,
        },
        admin: {
            type: Boolean,
            default: false
        },
        profile_image: {
            type: String,
        },
        type: {
            type: String
        }
    }],
    events: [{
        name: {
            type: String,
        },
        members: [{
            id: {
                type: mongoose.Schema.Types.ObjectId, ref: 'user',
                required: true,
            },
            name: {
                type: String,
            },
            admin: {
                type: Boolean,
                default: false
            },
            profile_image: {
                type: String,
            },
            type: {
                type: Boolean,
            }
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'user',
        },
        createdByName: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        },
        messages: [{
            date: {
                type: Date,
                default: Date.now
            },
            name: {
                type: String
            },
            senderId: {
                type: mongoose.Schema.Types.ObjectId, ref: 'user',
            },
            profile_image: {
                type: String
            },
            amount: {
                type: Number,
            },
            place: {
                type: String,
            },
            status: {
                type: String,
                default: 'sent'
            }
        }],
        status: {
            type: String,
            default: 'onGoing'
        },
        joined: {
            type: Boolean
        },
        transactions: [{
            senderId: {
                type: mongoose.Schema.Types.ObjectId, ref: 'user',
            },
            senderName: {
                type: String,
            },
            receiverId: {
                type: mongoose.Schema.Types.ObjectId, ref: 'user',
            },
            receiverName: {
                type: String,
            },
            amount: {
                type: Number
            }
        }],
    }],
    profile_image: {
        type: String,
        default: ''
    }
});


module.exports = mongoose.model('group' , groupSchema);

