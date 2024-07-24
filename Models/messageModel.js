
const mongoose = require("mongoose");
const { Schema } = mongoose;

const today = new Date();
today.setHours(23, 59, 59, 999);

const messageSchema = new Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'user',
        required: true,
    },
    receivers:[{
        receiverId:{
            type: mongoose.Schema.Types.ObjectId, ref: 'user',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        messages:[{
            senderId:{
                type: mongoose.Schema.Types.ObjectId, ref: 'user',
                required: true,
            },
            date:{
                type: Date,
                default: Date.now
            },
            amount:{
                type: Number,
                required: true,
            },
            status:{
                type: String,
                required: true,
            },
            lenderMode:{
                type: String,
                default: 'NA',
            },
            dueDate:{
                type: Date,
                default: today,
            },
            ror:{
                type: Number,
                default: 0,
            },
            incTime:{
                type: Number,
                default: 30,
            },
            numInc:{
                type: Number,
                default: 1
            },
            borrowerMode:{
                type: String,
                default: "NA"
            },
            borrowerPaidAmount:{
                type: Number,
                default: 0
            },
            lenderReciept:{
                type: String,
                default: ''
            },
            borrowerReciept:{
                type: String,
                default: ''
            }
        }],
    }],
});


module.exports = mongoose.model('message' , messageSchema);

