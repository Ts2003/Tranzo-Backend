
const express = require('express');
const passport = require('passport');
const router = express.Router();
const session = require("express-session")
require("../MiddleWares/passport")
const googleController = require('../Controllers/googleController')


router.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'This is not secret'
}));


router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/google-login', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  
}) , googleController.reDirect);

router.post('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


module.exports = router;

