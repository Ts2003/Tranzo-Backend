
const Transaction = require("../Models/transactionModel")

//CRUD OPERATIONS ON TRANSACTIONS
exports.fetchTransactions = async (req , res) => {
    let success = false;
    try{
        const {fromDate , toDate , filters} = req.body
        const transactions = await Transaction.find({
            user: req.user.id,
            date: { $gte: fromDate, $lte: toDate },
            category: { $in: filters },
            type: { $in: filters },
            mode: { $in: filters }
        }).sort({ "date": -1 })
        //console.log(transactions)
        success = true;
        res.status(200).json({success , transactions})
    }
    catch(err){
        console.error(err);
        return res.status(400).json({success , error: "Error while fetching transactions"})
    }
}


exports.addTransaction = async (req , res) => {
    let success = false;
    try{
        const {date , type , amount , name , category , mode} = req.body;
        if(!type || !amount || !mode){
            return res.status(400).json({success , error: "Fields with * are required"})
        }
        let transaction = await Transaction.create({
            user: req.user.id,
            date: date,
            type: type,
            amount: amount,
            name: name,
            category: category,
            mode: mode,
        })
        await transaction.save()
        success = true
        res.status(200).json({success , transaction: transaction.id})
    }
    catch(err){
        console.error(err);
        return res.status(400).json({success , error: "Error while adding transaction"})
    }
}




exports.updateTransaction = async (req , res) => {
    let success = false;
    try{
        const {date , type , amount , name , category , mode} = req.body;
        let newTransaction = {};
        if(date)    newTransaction.date = date
        if(type)    newTransaction.type = type
        if(amount)    newTransaction.amount = amount
        if(name)    newTransaction.name = name
        if(category)    newTransaction.category = category
        if(mode)    newTransaction.mode = mode

        let transaction = await Transaction.findById(req.params.id)
        if(!transaction){
            return res.status(404).json({success , error: "Not Found"})
        }
        if(transaction.user.toString() !== req.user.id){
            return res.status(401).json({success , error: "Access Denied"})
        }
        transaction = await Transaction.findByIdAndUpdate(req.params.id , {$set: newTransaction} , {new: true})
        success = true
        res.status(200).json({success , transaction: transaction.id})

    }
    catch(err){
        console.error(err);
        return res.status(400).json({success , error: "Error while updating transaction"})
    }
}



exports.removeTransaction = async (req , res) => {
    let success = false;
    try{

        let transaction = await Transaction.findById(req.params.id)
        if(!transaction){
            return res.status(404).json({success , error: "Not Found"})
        }
        if(transaction.user.toString() !== req.user.id){
            return res.status(401).json({success , error: "Access Denied"})
        }
        await Transaction.findByIdAndDelete(req.params.id);
        success = true
        res.status(200).json({success , transaction: transaction.id})

    }
    catch(err){
        console.error(err);
        return res.status(400).json({success , error: "Error while deleting transaction"})
    }
}


