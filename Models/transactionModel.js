const mongoose = require("mongoose");
const { Schema } = mongoose;


const transactionSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    date:{
        type: Date,
        default: Date.now - 60000
    },
    type:{
        type: String,
        enum: ['Credit', 'Debit'], 
        required: true,
    },
    amount:{
        type: Number,
        required: true,
    },
    name:{ 
        type: String, 
        required: true,
    },
    category:{
        type: String,
    },
    mode:{
        type: String,
        enum: ['Online', 'Cash', 'Cheque'],
        required: true
    }
});


module.exports = mongoose.model('transaction' , transactionSchema);



