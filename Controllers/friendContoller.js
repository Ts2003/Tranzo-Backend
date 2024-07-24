

const User = require('../Models/userModel');

exports.handleFriendRequest = async (req, res) => {
    let success = false;
    try {
        const { id , action } = req.body;

        const friend = await User.findOne({ _id: id });
        if (!friend) {
            return res.status(404).json({ success, error: "Friend Not Found" });
        }

        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(404).json({ success, error: "User Not Found" });
        }

        if(action === "send"){
            // Update the sender's document (assuming sender's ID is available in req.user)
            await User.findByIdAndUpdate(user._id, { $push: { sentRequest: {name: friend.name, userId: friend._id } } });

            // Update the receiver's document
            await User.findByIdAndUpdate(friend._id, { $push: { recievedRequest: {name: user.name, userId: user._id } } });
        }

        else if(action === "accept"){
            // Update the sender's document
            await User.findByIdAndUpdate(friend._id, { 
                $push: { friendsList: {name: user.name, userId: user._id } }, 
                $pull: { sentRequest: { userId: user._id } }
            });

            // Update the receiver's document
            await User.findByIdAndUpdate(user._id, { 
                $push: { friendsList: {name: friend.name, userId: friend._id } }, 
                $pull: { recievedRequest: { userId: friend._id } }
            });

        }

        else if(action === "reject"){
            await User.findByIdAndUpdate(friend._id, { 
                $pull: { sentRequest: { userId: user._id } }
            });

            // Update the receiver's document
            await User.findByIdAndUpdate(user._id, { 
                $pull: { recievedRequest: { userId: friend._id } }
            });
        }

        else if(action === "cancel"){
            await User.findByIdAndUpdate(user._id, { 
                $pull: { sentRequest: { userId: friend._id } }
            });

            // Update the receiver's document
            await User.findByIdAndUpdate(friend._id, { 
                $pull: { recievedRequest: { userId: user._id } }
            });
        }

        else if(action === "remove"){
            await User.findByIdAndUpdate(user._id, { 
                $pull: { friendsList: { userId: friend._id } , chats: { userId: friend._id } },
            });

            // Update the receiver's document
            await User.findByIdAndUpdate(friend._id, { 
                $pull: { friendsList: { userId: user._id }, chats: { userId: user._id } },
            });
        }

        success = true;
        res.status(200).json({ success, message: "Action done successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while handling friend request" });
    }
};


const Group = require('../Models/groupModel')
exports.fetchFriendLists = async (req, res) => {
    let success = false;
    try {
        const { type , group } = req.body;

        const groupId = group === null || group === undefined ? '' : group.id.toString()
        let friends;
        const user = req.user;
        const user1 = await User.find({_id: user.id})

        if (type === "friends") {
            const users = user1[0].friendsList
            friends = await User.find({ _id: { $in: users.map(friend => friend.userId) } });
            friends.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });

            if (groupId !== '') {
                let filteredFriends = friends;
                const group = await Group.findById(groupId);
                if (group) {
                    const groupMemberIds = group.members.map(member => member.id.toString());
                    filteredFriends = filteredFriends.filter(friend => !groupMemberIds.includes(friend._id.toString()));
                    friends = filteredFriends
                }
            }
        }

        else if (type === "sent") {
            const users = user1[0].sentRequest
            friends = await User.find({ _id: { $in: users.map(friend => friend.userId) } });
        }

        else if (type === "recieved") {
            const users = user1[0].recievedRequest
            friends = await User.find({ _id: { $in: users.map(friend => friend.userId) } }).sort({ date: -1 });
        }

        else if(type === "suggestions"){
            const userFriends = await User.findById(user.id).populate('friendsList.userId recievedRequest.userId', 'name');
            const userFriendIds = userFriends.friendsList.map(friend => friend.userId);
            const receivedRequestIds = userFriends.recievedRequest.map(request => request.userId);
            friends = await User.find({
                _id: { $nin: [...userFriendIds, ...receivedRequestIds, user.id] }
            }).select('name _id').limit(10);
        }

        else {
            return res.status(400).json({ success, error: "Invalid request type" });
        }

        if (!friends) {
            return res.status(404).json({ success, error: "Friends Not Found" });
        }

        success = true;
        res.status(200).json({ success, message: "Lists fetched successfully", friends });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching data" });
    }
};



exports.fetchChats = async (req, res) => {
    let success = false;
    try {

        const user = req.user;
        const user1 = await User.find({_id: user.id})
        const users = user1[0].chats
        let chats = await User.find({ _id: { $in: users.map(friend => friend.userId) } });
        

        success = true;
        res.status(200).json({ success, message: "Chats fetched successfully" , chats });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while fetching data" });
    }
};



exports.searchResults = async (req , res) => {
    let success = false;
    try {

        const user1 = req.user;
        const user = await User.find({_id: user1.id})
        const { query , type , group , isGroup } = req.body
        const groupId = group === null || group === undefined ? '' : group.id.toString()

        let users = await User.find({
            $and: [
                { _id: { $ne: req.user.id } },
                { name: { $regex: query, $options: 'i' } }
            ]
        }).select('_id name profile_image');

        if(user1 === null){
            return res.status(404).json({success , error: "User Not Found"})
        }

        const userFriends = user[0].friendsList.map(friend => friend.userId.toString());
        const receivedRequests = user[0].recievedRequest.map(request => request.userId.toString());

        let friends = [];
        let requests = [];
        let others = [];

        let results;

        users.forEach(result => {
            const userId = result._id.toString();
            if (userFriends.includes(userId)) {
                friends.push(result);
            } else if (receivedRequests.includes(userId)) {
                requests.push(result);
            } else {
                others.push(result)
            }
        });

        if(type === 'friends') {
            results = friends
        } else if (type === 'recieved') {
            results = requests
        } else if(type === 'suggestions') {
            results = others
        } else if(type === 'all') {
            results = [...friends, ...requests, ...others]
        }

        if (groupId !== '') {
            const group = await Group.findById(groupId);
            if (group) {
                const groupMemberIds = group.members.map(member => member.id.toString());
                results = results.filter(friend => !groupMemberIds.includes(friend._id.toString()) && friend._id.toString() !== req.user.id.toString());
            }
        } else if(isGroup) {
            results = results.filter(friend => friend._id.toString() !== req.user.id.toString())
        }

        
        success = true;
        res.status(200).json({ success, message: "Users searched successfully" , results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success, error: "Error while searching data" });
    }
}



