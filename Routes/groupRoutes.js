
//importing express
const express = require('express')

//creating a express router by express.Router()
const router = express.Router()


//fetching the user details from the middleware
const authenticateUser = require('../MiddleWares/authenticateUser')

const upload = require('../MiddleWares/Multer')

//fetching the controllers for the different api hits
const groupController = require('../Controllers/groupController')

//Routes
router.get('/fetchGroups' , authenticateUser , groupController.fetchGroups)
router.post('/fetchMembers' , authenticateUser , groupController.fetchMembers)
router.post('/createGroup' , authenticateUser , groupController.createGroup)
router.post('/addMembers' , authenticateUser , groupController.addMembers)
router.post('/handleAdmin' , authenticateUser , groupController.handleAdmin)
router.post('/checkAdmin' , authenticateUser , groupController.checkAdmin)
router.post('/leaveGroup' , authenticateUser , groupController.leaveGroup)
router.post('/uploadGroupPic' , upload.single("image") , authenticateUser , groupController.uploadGroupPic)
router.post('/removeMember' , authenticateUser , groupController.removeMember)
router.post('/createEvent' , authenticateUser , groupController.createEvent)
router.post('/fetchEvents' , authenticateUser , groupController.fetchEvents)
router.post('/joinEvent' , authenticateUser , groupController.joinEvent)
router.post('/fetchGroupMessages' , authenticateUser , groupController.fetchGroupMessages)
router.post('/sendGroupMessage' , authenticateUser , groupController.sendGroupMessage)
router.post('/changeMessageStatus' , authenticateUser , groupController.changeMessageStatus)
router.post('/settleEvent' , authenticateUser , groupController.settleEvent)
router.post('/fetchMyTransactions' , authenticateUser , groupController.fetchMyTransactions)

//exporting router
module.exports = router



