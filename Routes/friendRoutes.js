
//importing express
const express = require('express')

//creating a express router by express.Router()
const router = express.Router()


//fetching the user details from the middleware
const authenticateUser = require('../MiddleWares/authenticateUser')

//fetching the controllers for the different api hits
const friendController = require('../Controllers/friendContoller');

//Routes
router.post('/handleFriendRequest' , authenticateUser , friendController.handleFriendRequest)
router.post('/fetchFriendLists' , authenticateUser , friendController.fetchFriendLists)
router.get('/fetchChats' , authenticateUser , friendController.fetchChats)
router.post('/search' , authenticateUser , friendController.searchResults)

//exporting router
module.exports = router


