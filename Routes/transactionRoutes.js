
//importing express
const express = require('express')

//creating a express router by express.Router()
const router = express.Router()


//fetching the user details from the middleware
const authenticateUser = require('../MiddleWares/authenticateUser')

//fetching the controllers for the different api hits
const transactionController = require('../Controllers/transactionController');

//Routes
router.post('/fetchAllTransactions' , authenticateUser , transactionController.fetchTransactions)
router.post('/addTransaction' , authenticateUser , transactionController.addTransaction)
router.patch('/updateTransaction/:id' , authenticateUser , transactionController.updateTransaction)
router.delete('/removeTransaction/:id' , authenticateUser , transactionController.removeTransaction)

//exporting router
module.exports = router



