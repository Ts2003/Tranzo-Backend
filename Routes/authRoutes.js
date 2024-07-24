
//importing express
const express = require('express')

//creating a express router by express.Router()
const router = express.Router()
const upload = require('../MiddleWares/Multer')


//fetching the user details from the middleware
const authenticateUser = require('../MiddleWares/authenticateUser')

//fetching the controllers for the different api hits
const authController = require('../Controllers/authController');

//Routes
router.post('/signup' , authController.signup);
router.post('/login' , authController.login)
router.post('/getUser' , authenticateUser  , authController.getUser)
router.post('/getUserWithId/:id' , authenticateUser , authController.getUserWithId)
router.post('/uploadProfilePic', authenticateUser , upload.single("image") , authController.uploadProfilePic)
router.post('/editProfile' , authenticateUser  , authController.editProfile)

//exporting router
module.exports = router


