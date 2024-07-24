
const Notification = require('../Models/NotifiactionModel')
const User = require('../Models/userModel')

exports.addNotification = async (req , res) => {
    let success = false
    try {

        const { message , id , name } = req.body
        const notification = await Notification.create({
            user: id,
            message: message,
            name: name
        })

        await User.findByIdAndUpdate(id, { 
            $push: { newNotifications: { name: name } }, 
        });


        success = true
        res.status(200).json({success , notification})

    } catch (error) {
        console.error(error)
        return res.status(500).json({success , error: "Error While Adding Notification"})
    }
}


exports.fetchNotifications = async (req , res) => {
    let success = false
    try {

        const notifications = await Notification.find({ user: req.user.id }).sort({ date: -1 });
        const user1 = req.user;
        const user = await User.find({_id: user1.id})
        notifications.forEach(notification => {
            if(user[0].newNotifications.includes(notification._id)){
                notification.isNew = true
            }
            else notification.isNew = false
        })

        success = true
        res.status(200).json({success , notifications})

    } catch (error) {
        console.error(error)
        return res.status(500).json({success , error: "Error While Fetching Notifications"})
    }
}



exports.removeNewNotifi = async (req , res) => {
    let success = false
    try {

        const id = req.user.id
        await Notification.updateMany({ user: id }, { new: false });
            
        success = true
        res.status(200).json({success , message: "Notifications Removed Succesfully"})

    } catch (error) {
        console.error(error)
        return res.status(500).json({success , error: "Error While Adding Notification"})
    }
}


exports.checkNotifications = async (req , res) => {
    let success = false
    try {

        let find = true;
        const id = req.user.id
        const array = await Notification.find({ user: id , new: true });
        if(array.length === 0)  find = false
        success = true
        res.status(200).json({success , message: "Notifications Removed Succesfully" , find})

    } catch (error) {
        console.error(error)
        return res.status(500).json({success , error: "Error While Checking Notification"})
    }
}

