
require("dotenv").config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/userModel')

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3003/auth/google/callback',
    },
    async function(accessToken, refreshToken, profile, cb) {
        const user = await User.findOne({ googleId: profile.id })
        if(user) {
           return cb(null , user);
        }
        else {
            const newUser = await User.create({
                name: profile.displayName,
                googleId: profile.id
            });
            return cb(null , newUser);
        }
    }
));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});


