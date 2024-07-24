
const express = require('express')
const app = express()

const { Server } = require("socket.io");
const { createServer } = require('http')
const server = createServer(app);
const io = new Server(server , {
  cors: {
    origin: "*",
  },
});


const userSocketMap = new Map();

io.on("connection", (socket) => {

  
  //connection
  socket.on('userId' , (id) => {
    userSocketMap.set(id, socket.id);
    console.log("User ID", id, "is mapped to socket ID", socket.id);
    io.emit('online' , id)
  })



  //friend
  socket.on('isConnected' , (item) => {
    const isOnline = userSocketMap.has(item._id)
    const id = item._id
    io.emit('isConnected' , isOnline , id)
  })

  

  //friend
  socket.on("action" , async (item , action1 , user) => {
    const friendSocketId = userSocketMap.get(item._id)
    console.log("Friend Socket id is " + friendSocketId)
    const m = (action1 === 'send') ? `${user.name} has sent you a connection request` : `${user.name} has accepted your connection request`
    const notifi = { name: user.name , message: m , date: Date.now() , new: true }
    if(action1 === 'send' || action1 === 'accept')  io.to(friendSocketId).emit('notify' , notifi)
    io.to([friendSocketId , socket.id]).emit("recieved" , item)
  })

  
  
  //friend
  socket.on('message' , (item , message , user) => {
    const friendSocketId = userSocketMap.get(item._id)
    console.log("Friend Socket id is " + friendSocketId)
    const m = `${user.name} has lended you an amount of ${message.amount}. Kindly Check`
    const notifi = { name: user.name , message: m , date: Date.now() , new: true }
    io.to(friendSocketId).emit('notify' , notifi)
    io.to([friendSocketId , socket.id]).emit("recievedMessage" , message)
  })

  

  //friend
  socket.on('changed' , (item , friend , m , user) => {
    const friendSocketId = userSocketMap.get(friend._id)
    console.log("Friend Socket id is " + friendSocketId)
    const notifi = { name: user.name , message: m , date: Date.now() , new: true }
    io.to(friendSocketId).emit('notify' , notifi)
    io.to([friendSocketId , socket.id]).emit("changedItem" , item)
  })

    

  //friend
  socket.on('verify' , (item , friend , user , message) => {
    const friendSocketId = userSocketMap.get(friend._id)
    console.log("Friend Socket id is " + friendSocketId)
    const m = `${user.name} returned an amount of ${message.amount} with a reciept`
    const notifi = { name: user.name , message: m , date: Date.now() , new: true }
    io.to(friendSocketId).emit('notify' , notifi)
    io.to([friendSocketId , socket.id]).emit("verifyFriend" , item)
  })

  
  
  //friend
  socket.on('settle' , (item , friend , user , message) => {
    const friendSocketId = userSocketMap.get(friend._id)
    console.log("Friend Socket id is " + friendSocketId)
    const m = `${user.name} settled an amount of ${message.amount}`
    const notifi = { name: user.name , message: m , date: Date.now() , new: true }
    io.to(friendSocketId).emit('notify' , notifi)
    io.to([friendSocketId , socket.id]).emit("settled" , item)
  })

  

  //user profile
  socket.on('image' , async (data , friend) => {
    const friendSocketId = userSocketMap.get(friend._id)
    console.log("Friend Socket id is " + friendSocketId)
    console.log(data)
    io.to([friendSocketId , socket.id]).emit("image" , data)
  })



  //transactions
  socket.on('transactions' , (arg) => {
    io.to(socket.id).emit("transactions" , arg)
  })



  //group
  socket.on('groupMessage' , (room , message , event , group) => {
    const m = `You have some new messages in the event ${event.name}. Check out now`
    console.log(event.members)
    for(const member of event.members) {
      const friendSocketId = userSocketMap.get(member.id)
      console.log("Friend Socket id is " + friendSocketId)
      const notifi = { name: group.name , message: m , date: Date.now() , new: true }
      if(friendSocketId !== socket.id) io.to(friendSocketId).emit('notify' , notifi)
      io.to(friendSocketId).emit('groupMessage' , message , room)
    }
    console.log('///////////////////////////////////')
  })



  //group
  socket.on('members' , (members) => {
    for(const member of members) {
      const friendSocketId = userSocketMap.get(member.id)
      console.log("Friend Socket id is " + friendSocketId)
      io.to(friendSocketId).emit('members' , members)
    }
  })



  socket.on('settled' , (room , event , group) => {
    const m = `${event.name} is settled by admin`
    for(const member of event.members) {
      const friendSocketId = userSocketMap.get(member.id)
      console.log("Friend Socket id is " + friendSocketId)
      const notifi = { name: group.name , message: m , date: Date.now() , new: true }
      if(friendSocketId !== socket.id) io.to(friendSocketId).emit('notify' , notifi)
      io.to(friendSocketId).emit('settled' , room)
    }
  })



  socket.on('added' , (group , members) => {
    const m = `You are added to the group ${group.name} by the admin`
    for(const member of members) {
      const friendSocketId = userSocketMap.get(member._id)
      console.log("Friend Socket id is " + friendSocketId)
      const notifi = { name: group.name , message: m , date: Date.now() , new: true }
      if(friendSocketId !== socket.id) io.to(friendSocketId).emit('notify' , notifi)
      io.to(friendSocketId).emit('added')
    }
  })



  const Group = require('../Models/groupModel')
  socket.on('created' , async (event , groupId) => {
    const group = await Group.findById(groupId)
    const m = `A new event ${event.name} is created in the group ${group.name}`
    for(const member of group.members) {
      const friendSocketId = userSocketMap.get(member.id.toString())
      console.log("Friend Socket id is " + friendSocketId)
      const notifi = { name: group.name , message: m , date: Date.now() , new: true }
      if(friendSocketId !== socket.id) io.to(friendSocketId).emit('notify' , notifi)
      io.to(friendSocketId).emit('created')
    }
  })



  socket.on('groupCancelled' , (group , event , messageId) => {
    const room = group.id + event._id
    for(const member of event.members) {
      const friendSocketId = userSocketMap.get(member.id)
      console.log("Friend Socket id is " + friendSocketId)
      io.to(friendSocketId).emit('groupCancelled' , room , messageId)
    }
  })



  socket.on('groupReload' , async (group , friendId) => {
    for(const member of group.members) {
      const friendSocketId = userSocketMap.get(member.id.toString())
      console.log("Friend Socket id is " + friendSocketId)
      io.to(friendSocketId).emit('groupReload' , group._id)
    }
    const m = `You are removed from the group ${group.name} by the admin`
    const notifi = { name: group.name , message: m , date: Date.now() , new: true }
    const friendSocketId = userSocketMap.get(friendId.toString())
    io.to(friendSocketId).emit('notify' , notifi)
  })



  //diconnection
  
  socket.on("disconnect", () => {
    for (const [key, value] of userSocketMap.entries()) {
      if (value === socket.id) {
        userSocketMap.delete(key);
        console.log("User ID", key, "disconnected");
        const id = key
        io.emit('offline' , id)
        break;
      }
    }
  });

});

module.exports = { app , server }

