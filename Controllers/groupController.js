

const User = require('../Models/userModel');
const Group = require('../Models/groupModel')
const createPDF = require('../Utils/CreatePDF');

exports.fetchGroups = async (req, res) => {
    let success = false;
    try {

        let groups;
        const user = await User.find({_id: req.user.id})

        groups = user[0].groups
        groups.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        for(const group of groups) {
            const g = await Group.findById(group.id)
            group.numberOfMembers = g.members.length
            group.profile_image = g.profile_image
        }

        success = true;
        res.status(200).json({ success, message: "Groups fetched successfully", groups });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching groups" });
    }
};



exports.fetchMembers = async (req, res) => {
    let success = false;
    try {

        const { groupId , event , isGroup } = req.body

        let members;
        const group = await Group.findById({ _id: groupId })

        if(isGroup === true) {
            members = group.members
        }
        else {
            const event1 = group.events.find(e => e._id.toString() === event._id.toString())
            members = event1.members
        }

        members.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        let admin = false

        const user = await User.find({ _id: req.user.id })
        const friendsIds = user[0].friendsList.map(friend => friend.userId.toString())

        let admins = []
        let friends = []
        let others = []
        let user1;
        for(const member of members) {
            
            if(member.id.toString() === req.user.id.toString()) {
                if(member.admin === true){
                    admin = true;
                }
            }

            const user = await User.findById(member.id)
            member.name = user.name
            member.profile_image = user.profile_image
            
            if(member.id.toString() === req.user.id.toString()) {
                member.type = 'user'
                user1 = member
                continue;
            }
            if(member.admin === true) {
                member.type = 'admin'
                admins.push(member)
            }
            else if(friendsIds.includes(member.id.toString())) {
                member.type = 'friend'
                friends.push(member)
            }
            else {
                member.type = 'other'
                others.push(member)
            }
        }
        const newMembers = [user1 , ...admins , ...friends , ...others]
        members = newMembers


        success = true;
        res.status(200).json({ success, message: "Members fetched successfully", members , admin });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching members" });
    }
};



exports.createGroup = async (req, res) => {
    let success = false;
    try {

        const { name , members } = req.body

        if(name === '') {
            return res.status(400).json({success , error: "Provide Group Name"})
        }

        if(name.length < 8) {
            return res.status(400).json({success , error: "Group Name should be of atleast 8 characters"})
        }

        const startsWithAlphabetRegex = /^[a-zA-Z]/;
        if (!startsWithAlphabetRegex.test(name)) {
            return res.status(400).json({ success, error: "Group Name must start with an alphabet character" });
        }

        if(members.length === 0) {
            return res.status(400).json({success , error: "Please select alteast one connection"})
        }

        const group = await Group.create({
            name: name,
        })
        await group.save()

        const user = await User.find({_id: req.user.id})
        user[0].groups.push({ name: group.name , id: group._id })
        await user[0].save()
        group.members.push({id: req.user.id , name: user[0].name , profile_image: user[0].profile_image, admin: true})

        for(const member of members) {
            const user = await User.find({_id: member._id})
            user[0].groups.push({ name: group.name , id: group._id })
            let isAdmin = false;
            if(member._id === req.user.id)  isAdmin = true
            group.members.push({id: member._id , name: member.name , profile_image: member.profile_image, admin: isAdmin})
            await user[0].save()
        }
        await group.save()
        
        success = true;
        res.status(200).json({ success, message: "Group created successfully", group });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while creating group" });
    }
};



exports.addMembers = async (req, res) => {
    let success = false;
    try {

        const { members , group1 } = req.body

        if(members.length === 0) {
            return res.status(400).json({success , error: "Please select alteast one connection"})
        }

        const group = await Group.findById(group1.id)

        for(const member of members) {
            const user = await User.find({_id: member._id})
            user[0].groups.push({ name: group.name , id: group._id })
            let isAdmin = false;
            group.members.push({id: member._id , name: member.name , profile_image: member.profile_image, admin: isAdmin})
            await user[0].save()
        }
        await group.save()
        
        success = true;
        res.status(200).json({ success, message: "Members added successfully", group });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while adding members" });
    }
};



exports.createEvent = async (req, res) => {
    let success = false;
    try {

        const { name , groupId } = req.body

        if(name === ''){
            return res.status(400).json({success , error: "Please provide name"})
        }

        if(name.length < 8) {
            return res.status(400).json({success , error: "Event Name should be of atleast 8 characters"})
        }

        const startsWithAlphabetRegex = /^[a-zA-Z]/;
        if (!startsWithAlphabetRegex.test(name)) {
            return res.status(400).json({ success, error: "Event Name must start with an alphabet character" });
        }

        const user = await User.find({_id: req.user.id})

        const event = {
            name: name,
            members: [{ id: req.user.id, name: user[0].name, admin: true , profile_image: user[0].profile_image }],
            createdBy: req.user.id
        }
        
        const group = await Group.find({_id: groupId})
        group[0].events.push(event)
        await group[0].save()


        success = true;
        res.status(200).json({ success, message: "Event created successfully", event });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while creating event" });
    }
};



exports.fetchEvents = async (req, res) => {
    let success = false;
    try {

        const { groupId } = req.body

        let events = [];
        const group = await Group.find({_id: groupId})
        events = group[0].events
        events.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        for(const event of events) {
            const memberIds = event.members.map(member => member.id.toString())
            
            if(memberIds.includes(req.user.id.toString())){
                event.joined = true
            }
            else event.joined = false

            const user = await User.findById(event.createdBy)
            event.createdByName = user.name
        }

        success = true;
        res.status(200).json({ success, message: "Events fetched successfully" , events });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching events" });
    }
};



exports.leaveGroup = async (req, res) => {
    let success = false;
    try {

        const { groupId } = req.body

        let events = []
        const group = await Group.find({_id: groupId})
        events = group[0].events
        
        for(const event of events) {
            if(event.status === 'onGoing'){
                const memberIds = event.members.map(member => member.id.toString())
                
                if(memberIds.includes(req.user.id.toString())){
                    return res.status(401).json({success , error: "You are not all allowed to leave this group as you are already a part of one of the events that is not settled yet"})
                }
                const user = await User.findById(event.createdBy)
                event.createdByName = user.name
            }
        }

        let admin = false;
        let numAdmins = 0;

        for(const member of group[0].members) {
            if(member.id.toString() === req.user.id.toString()) {
                admin = member.admin
            }
            if(member.admin === true)   numAdmins += 1;
        }
        if(admin && numAdmins === 1) {
            return res.status(401).json({success , error: "You cannot leave the group as you are the only group admin"})
        }


        await Group.findByIdAndUpdate(groupId , {
            $pull: {members: {id: req.user.id}}
        })
        await User.findByIdAndUpdate(req.user.id , {
            $pull: {groups: {id: groupId}},
            numberOfMembers: {}
        })

        success = true;
        res.status(200).json({ success, message: "Group Leaved successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching members" });
    }
};



exports.joinEvent = async (req , res) => {
    let success = false;
    try {

        const { groupId , eventId } = req.body

        const user = await User.find({ _id: req.user.id })

        const group = await Group.findById({ _id: groupId })
        if(group) {

            const memberIds = group.members.map(member => member.id.toString())
            if(!memberIds.includes(req.user.id.toString())){
                return res.status(400).json({ success , error: "You are not a part of a group" })
            }

            const event = group.events.find(event => event._id.toString() === eventId)

            if(event) {
                if(event.status === 'settled') {
                    return res.status(400).json({ success , error: "This event is already settled" })
                }
                event.members.push({name: user[0].name , id: req.user.id , profile_image: user[0].profile_image})
            }
            await group.save()
        }

        
        success = true;
        res.status(200).json({ success, message: "Event joined successfully"});

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while joining event" });
    }
}



exports.fetchGroupMessages = async (req, res) => {
    let success = false;
    try {

        const { groupId , eventId } = req.body
        let messages = [];
        let members = [];
        let status;
        const group = await Group.findById({ _id: groupId })
        if(group) {
            const event = group.events.find(e => e._id.toString() === eventId.toString())
            if(event) {
                messages = event.messages
                for(const message of messages) {
                    const user = await User.findById(message.senderId)
                    message.name = user.name
                    message.profile_image = user.profile_image
                }
                status = event.status
                members = event.members
            }
            await group.save()
        }

        success = true;
        res.status(200).json({ success, message: "Messages fetched successfully" , messages , status , members});

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching messages" });
    }
};



exports.sendGroupMessage = async (req, res) => {
    let success = false;
    try {

        const { amount , groupId , eventId , place } = req.body

        const regex = /^[0-9]+$/;
        if(amount === "" || !regex.test(amount)){
            return res.status(400).json({error: "Invalid Amount"})
        }
        if(place === '') {
            return res.status(400).json({error: "Please provide place of expense"})
        }

        const user = await User.find({_id: req.user.id})
        const group1 = await Group.findById({ _id: groupId })
        let message;
        if(group1) {
            const event1 = group1.events.find(e => e._id.toString() === eventId.toString())
            if(event1) {
                event1.messages.push({ name: user[0].name , amount: amount , place: place , status: 'Sent' , senderId: req.user.id })
                message = event1.messages[event1.messages.length - 1]                
            }
            await group1.save()
        }

        success = true;
        res.status(200).json({ success, msg: "Message sent successfully" , message });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while sending message" });
    }
};



exports.changeMessageStatus = async (req, res) => {
    let success = false;
    try {

        const { groupId , eventId , messageId } = req.body.item

        const group = await Group.findById(groupId)
        if(group) {
            const event = group.events.find(e => e._id.toString() === eventId.toString())
            if(event) {
                const message = event.messages.find(m => m._id.toString() === messageId.toString())
                message.status = 'cancelled'
            }
            await group.save()
        }

        success = true;
        res.status(200).json({ success, message: "Status changed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while changing status" });
    }
};


exports.settleEvent = async (req, res) => {
    let success = false;
    try {

        const { groupId , eventId } = req.body

        const group = await Group.findById(groupId)
        const paymentsMap = {}
        const amountMap = {}
        if(group) {
            const event = group.events.find(e => e._id.toString() === eventId.toString())
            if(event) {
                for(const message of event.messages) {
                    const senderId = message.senderId
                    if(message.status === 'Sent') {
                        if (!paymentsMap[senderId]) {
                            paymentsMap[senderId] = [];
                        }
                        if (!amountMap[senderId]) {
                            amountMap[senderId] = [];
                        }
                        paymentsMap[senderId].push(message)
                        amountMap[senderId].push(message.amount)
                    }
                }

                const paymentsVector = [];
                let totalExp = 0
                const uniqueMemberIds = event.members.map(member => member.id);

                uniqueMemberIds.forEach(memberId => {
                    if (!amountMap[memberId]) {
                        amountMap[memberId] = [];
                    }
                    const totalAmount = amountMap[memberId].reduce((acc, curr) => acc + curr, 0);
                    paymentsVector.push({ senderId: memberId, totalAmount });
                    totalExp += totalAmount;
                });

                let expPerMember = totalExp / event.members.length
                createPDF(paymentsMap , eventId , expPerMember , amountMap);

                paymentsVector.sort((a, b) => a.totalAmount - b.totalAmount);

                const transactions = [];
                let left = 0 , right = paymentsVector.length - 1
                while(left < right) {
                    if(paymentsVector[left].totalAmount === expPerMember) {
                        left++;
                    }
                    else if(paymentsVector[right].totalAmount === expPerMember) {
                        right--;
                    }
                    else {
                        const senderId = paymentsVector[left].senderId
                        const receiverId = paymentsVector[right].senderId
                        let leftMargin = expPerMember - paymentsVector[left].totalAmount
                        let rightMargin = paymentsVector[right].totalAmount - expPerMember
                        if(leftMargin < rightMargin) {
                            const amount = leftMargin
                            transactions.push({ senderId , receiverId , amount })
                            paymentsVector[right].totalAmount -= leftMargin
                            left++;
                        }
                        else {
                            const amount = rightMargin
                            transactions.push({ senderId , receiverId , amount })
                            paymentsVector[left].totalAmount += rightMargin
                            if(leftMargin === rightMargin)  left++;
                            right--;
                        }
                    }
                }

                event.transactions = transactions
                event.status = 'settled'

                console.log(transactions);
            }
            await group.save()
        }

        success = true;
        res.status(200).json({ success, message: "Event Settled successfully" , paymentsMap , amountMap });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while settling event" });
    }
};



exports.fetchMyTransactions = async (req , res) => {
    let success = false;
    try {

        const { groupId , eventId } = req.body

        const group = await Group.findById(groupId)
        let transactions = [];
        const userId = req.user.id.toString()
        if(group) {
            const event = group.events.find(e => e._id.toString() === eventId.toString())
            if(event) {
                for(const transaction of event.transactions) {
                    if(transaction.senderId.toString() === userId || transaction.receiverId.toString() === userId) {
                        if(transaction.senderId.toString() !== userId) {
                            const friend = await User.findById(transaction.senderId)
                            transaction.senderName = friend.name
                            await group.save()
                        }
                        else {
                            const friend = await User.findById(transaction.receiverId)
                            transaction.receiverName = friend.name
                            await group.save()
                        }
                        transactions.push(transaction)
                    }
                }
            }
        }

        success = true;
        res.status(200).json({ success, message: "Transactions fetched successfully" , transactions });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching transactions" });
    }
}



exports.removeMember = async (req, res) => {
    let success = false;
    try {

        const { groupId , memberId } = req.body

        let events = []
        const group = await Group.find({_id: groupId})
        events = group[0].events
        
        for(const event of events) {
            if(event.status === 'onGoing'){
                const memberIds = event.members.map(member => member.id.toString())
                
                if(memberIds.includes(memberId.toString())){
                    return res.status(401).json({success , error: "This member cannot be removed as it is a part of one of the events that is not settled yet"})
                }
            }
        }

        for(const member of group[0].members) {
            if(member.id.toString() === req.user.id.toString()) {
                if(member.admin === true){
                    return res.status(402).json({ success , error: "You cannot remove group admin"})
                }
            }
        }

        await Group.findByIdAndUpdate(groupId , {
            $pull: {members: {id: memberId}}
        })
        await User.findByIdAndUpdate(memberId , {
            $pull: {groups: {id: groupId}},
            numberOfMembers: {}
        })

        success = true;
        res.status(200).json({ success, message: "Member removed successfully" , group });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while removing member" });
    }
};



exports.handleAdmin = async (req, res) => {
    let success = false;
    try {

        const { groupId , memberId } = req.body

        const group = await Group.findById(groupId)

        for(const member of group.members) {
            if(member.id.toString() === memberId.toString()) {
                member.admin = true;
                break;
            }
        }

        await group.save()

        success = true;
        res.status(200).json({ success, message: "Admin made successfully" , group });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while making admin" });
    }
};



exports.uploadGroupPic = async (req , res) => {
    let success = false
    try{

        const { image , groupId } = req.body
        if(image === 'null') {
            return res.status(400).json({success , error: "Please Upload Image"})
        }

        let group = await Group.findById(groupId)
        console.log(group)
        if(group){
            group.profile_image = req.file.filename
            await group.save()
        }

        success = true
        res.status(200).json({success , imageName: req.file.filename , message: "Image Uploaded"})
    } catch (error) {
        console.error(error)
        res.status(500).json({success , error: "Error while uploading profile"})
    }
}



exports.checkAdmin = async (req , res) => {
    let success = false
    try{

        let admin = false
        const { groupId } = req.body
        const group = await Group.findById(groupId)
        for(const member of group.members) {
            if(member.id.toString() === req.user.id.toString()) {
                if(member.admin === true)   admin = true
                break;
            }
        }

        success = true
        res.status(200).json({success , message: "Validation is done" , admin})
    } catch (error) {
        console.error(error)
        res.status(500).json({success , error: "Error while validating user"})
    }
}

