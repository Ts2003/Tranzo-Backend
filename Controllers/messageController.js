
const Message = require('../Models/messageModel');
const User = require('../Models/userModel')

exports.sendMessage = async (req, res) => {
    let success = false;
    try {
        
        const { amount , status , name } = req.body

        const regex = /^[0-9]+$/;
        if(amount === "" || !regex.test(amount)){
            return res.status(400).json({error: "Invalid Amount"})
        }

        const senderId = req.user.id
        const receiverId = req.params.id

        let message = await Message.findOne({ senderId });
        let _id;

        if (message) {
            const existingReceiver = message.receivers.find(receiver => receiver.receiverId.toString() === receiverId);
            
            if (existingReceiver) {
                const newMessage = { senderId, amount, status };
                existingReceiver.messages.push(newMessage);
                await message.save();
                _id = existingReceiver.messages[existingReceiver.messages.length - 1]._id
            } 
            
            else {
                message.receivers.push({ receiverId: receiverId, name: name , messages: [{ senderId, amount, status }] });
                _id = message.receivers[message.receivers.length - 1].messages[0]._id;
            }
            message = await message.save();
        }
        
        else {
            message = await Message.create({
                senderId,
                receivers: [{ receiverId: receiverId, name: name, messages: [{ senderId, amount, status }] }]
            });
            _id = message.receivers[0].messages[0]._id;
            
        }

        const user = await User.findOne({ _id: senderId })
        const friend = await User.findOne({ _id: receiverId })
        if(!user.chats.includes({name: friend.name, userId: friend._id }))  {
            await User.findByIdAndUpdate(friend._id, { 
                $push: { chats: {name: user.name, userId: user._id } }, 
            });

            await User.findByIdAndUpdate(user._id, { 
                $push: { chats: {name: friend.name, userId: friend._id } }, 
            });
        }

        const date = new Date(Date.now())
        const newMessage = {senderId , amount , status , date , _id}

        success = true
        res.status(200).json({ success, message: newMessage })

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while sending message" });
    }
};


exports.fetchMessages = async (req, res) => {
    let success = false;
    try {
        
        const userId = req.user.id
        const friendId = req.params.id
        let userMessages = [];
        let user = await Message.findOne({ senderId: userId})
        if(user){
            const existingReceiver = user.receivers.find(receiver => receiver.receiverId.toString() === friendId);
            if (existingReceiver) {
                userMessages = existingReceiver.messages
            }
        }
        let friendMessages = [];
        let friend = await Message.findOne({ senderId: friendId })
        if(friend){
            const existingReceiver = friend.receivers.find(receiver => receiver.receiverId.toString() === userId);
            if (existingReceiver) {
                friendMessages = existingReceiver.messages
            }
        }
        let messages = [...userMessages, ...friendMessages];
        messages.sort((a, b) => new Date(a.date) - new Date(b.date));
        success = true
        res.status(200).json({ success, messages })

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching messages" });
    }
};


exports.changeStatus = async (req , res) => {
    let success = false;
    try {
        const { item } = req.body

        let user = await Message.findOne({ senderId: item.senderId})
        //console.log(item)
        if(user){
            const existingReceiver = user.receivers.find(receiver => receiver.receiverId.toString() === item.receiverId);
            if (existingReceiver) {
                const message = existingReceiver.messages.find(message => message._id.toString() === item.messageId);
                message.status = item.newStatus
                await user.save()
            }
        }
        success = true
        res.status(200).json({success , message : 'Status Changed Succesfully'})
    } catch (error) {
        console.error("Error While Changing Status" , error)
    }
}


exports.sendPayment = async (req , res) => {
    let success = false;
    try {
        const { item , isFirst } = req.body
        let currentDate
        if(isFirst) currentDate = item.currentDate.toString()
        const dueDate = item.dueDate.toString()

        if(item.lenderMode === '' || item.ror === '' || item.incTime === ''){
            return res.status(400).json({success , error: 'Fields with * are required'})
        }

        if(isFirst && dueDate < currentDate){
            return res.status(400).json({success , error: 'Invalid Date'})
        }

        if(item.ror > 100 || item.ror < 0){
            return res.status(400).json({success , error: 'Invalid Interest Rate'})
        }

        if(item.incTime <= 0){
            return res.status(400).json({success , error: 'Invalid Increment Time'})
        }

        let user = await Message.findOne({ senderId: item.senderId})
        if(user){
            const existingReceiver = user.receivers.find(receiver => receiver.receiverId.toString() === item.receiverId);
            
            if (existingReceiver) {
                const message = existingReceiver.messages.find(message => message._id.toString() === item.messageId);
                if(isFirst){
                    message.status = item.newStatus
                    message.lenderMode = item.lenderMode
                    message.ror = item.ror
                    message.incTime = item.incTime
                }
                else message.amount = item.amount
                message.dueDate = new Date(item.dueDate)
                message.numInc = item.numInc
                await user.save()
            }
        }
        success = true
        res.status(200).json({success , msg : 'Payment Send Succesfully'})
    } catch (error) {
        console.error("Error While Sending Payment" , error)
    }
}


exports.returnPayment = async (req , res) => {
    let success = false;
    try {
        const { item } = req.body

        if(item.borrowerMode === ''){
            return res.status(400).json({success , error: 'All Fields are required'})
        }

        let user = await Message.findOne({ senderId: item.senderId})
        if(user){
            const existingReceiver = user.receivers.find(receiver => receiver.receiverId.toString() === item.receiverId);
            if (existingReceiver) {
                const message = existingReceiver.messages.find(message => message._id.toString() === item.messageId);
                message.borrowerMode = item.borrowerMode
                message.status = item.newStatus
                message.borrowerPaidAmount = item.borrowerPaidAmount
                await user.save()
            }
        }
        success = true
        res.status(200).json({success , msg : 'Payment Returned Succesfully'})
    } catch (error) {
        console.error("Error While Returning Payment" , error)
    }
}


exports.uploadImage = async (req , res) => {
    let success = false
    try{

        const { image , senderId , receiverId , messageId , lender } = req.body

        if(image === 'null'){
            return res.status(400).json({success , error: "Fields with * are required"})
        }
        //console.log(image)
        let user = await Message.findOne({ senderId: senderId})
        if(user){
            const existingReceiver = user.receivers.find(receiver => receiver.receiverId.toString() === receiverId);
            if (existingReceiver) {
                const message = existingReceiver.messages.find(message => message._id.toString() === messageId);
                if(lender === 'true')  message.lenderReciept = req.file.filename
                else message.borrowerReciept = req.file.filename
                await user.save()
            }
        }

        //console.log(req.body)

        success = true
        res.status(200).json({success , imageName: req.file.filename , message: "Image Uploaded"})
    } catch (error) {
        console.error(error)
        res.status(500).json({success , error: "Error"})
    }
}

