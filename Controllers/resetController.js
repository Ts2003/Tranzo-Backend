require("dotenv").config()
const validator = require('validator')
const User = require('../Models/userModel')
const crypto = require('crypto')
const mailSender = require('../Utils/mailSender')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_Secret = process.env.JWT_SECRET


exports.forgotPass = async (req, res) => {
    let success = false;
    try{  
        const { email } = req.body;
        if(!validator.isEmail(email)){
          return res.status(403).json({success , error: "Invalid Email"})
        }
    
        // Check if user is already present
        const user = await User.findOne({ email });
        
        if (!user) {
          return res.status(404).json({success , error: 'User not found',});
        }
  
        // Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        const resetUrl = `https://tranzo-backend-1.onrender.com/api/auth/reset-window/${resetToken}`;
        await mailSender(
          email,
          "Password Reset Link",
          `<h1>Please click on the link below to change your password. If its not you, then ignore</h1>
           <p>${resetUrl}</p>`
        );
        success = true
        res.status(200).json({success , message: 'Password reset token sent' });
  
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({success , error: error.message });
    }  
};



exports.resetPass = async (req, res) => {
    let success = false;
    try {
        const { nPassword, cPassword } = req.body;
        const resetToken = req.params.token;

        if (nPassword !== cPassword) {
            return res.status(400).json({ success, error: 'Both Passwords do not match' });
        }

        const user = await User.findOne({
            resetToken,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(401).json({ success, error: 'Invalid or expired reset token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nPassword, salt);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        const data = {
            user:{
                id: user.id
            }
        }

        //Generating a JWT token
        var authToken = jwt.sign(data, JWT_Secret)
        const newNotifications = user.newNotifications

        const userId = user.id

        success = true;
        return res.status(200).json({ success, authToken, userId , message: 'Password reset successful' , newNotifications });

    }catch (error) {
        console.error(error);
        return res.status(400).json({ success, error: "Error while reseting the password" });
    }
};



exports.showResetWindow = async(req , res) => {
    let success = false
    try{
        const token = req.params.token
        res.redirect(`https://celebrated-puppy-e36281.netlify.app/resetWindow/${token}`)
    }
    catch(error){
        console.error(error)
        return res.status(400).json({success , error: "Error while opening link"})
    }
}

