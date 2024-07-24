
const express = require('express');
const resetController = require('../Controllers/resetController');
const router = express.Router();

router.post('/forgot-pass', resetController.forgotPass)
router.get('/reset-window/:token', resetController.showResetWindow)
router.post('/reset-pass/:token', resetController.resetPass)

module.exports = router;
