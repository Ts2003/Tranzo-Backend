
//importing express
const express = require('express')

//creating a express router by express.Router()
const router = express.Router()


//fetching the user details from the middleware
const authenticateUser = require('../MiddleWares/authenticateUser')
const upload = require('../MiddleWares/Multer')

//fetching the controllers for the different api hits
const messageController = require('../Controllers/messageController');


//Routes
router.post('/sendMessage/:id' , authenticateUser , messageController.sendMessage)
router.get('/fetchMessages/:id', authenticateUser, messageController.fetchMessages)
router.post('/changeStatus', authenticateUser, messageController.changeStatus)
router.post('/sendPayment', authenticateUser, messageController.sendPayment)
router.post('/returnPayment', authenticateUser, messageController.returnPayment)
router.post('/uploadImage', authenticateUser , messageController.uploadImage)

//exporting router
module.exports = router

