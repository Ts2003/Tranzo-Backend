
require("dotenv").config()

//importing bcrypt
const bcrypt = require('bcrypt')

//importing jsonwebtoken
const jwt = require('jsonwebtoken')

//Using a users schema and otp schema to connect and store data in the database
const User = require('../Models/userModel')
const OTP = require('../Models/otpModel');

//creating a JWT_Secret string as a signature for user authentication
const JWT_Secret = process.env.JWT_SECRET


exports.signup = async (req, res) => {

    //Creating a user in database by the try catch block
    let success;
    try{

        const { otp , email , password , name } = req.body;
        // Check if all details are provided
        if ( !otp ) {
            success = false
            return res.status(403).json({success , error: "Please enter your OTP"})
        }
        
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || otp !== response[0].otp) {
            success = false
            return res.status(400).json({success , error: "The OTP is not valid"})
        }

        //Generating a salt
        const salt = await bcrypt.genSalt(10);

        //Hashing a password
        const secPass = await bcrypt.hash(password , salt);

        //Creating a user
        let user = await User.create({
            name: name,
            email: email,
            password: secPass
        })

        //Creating a data object that is to be given to the server for autherozing the user
        const data = {
            user:{
                id: user.id
            }
        }

        //Generating a JWT token
        var authToken = jwt.sign(data, JWT_Secret)

        const userId = user.id

        //giving back response
        success = true
        res.json({success , authToken , userId })
    }
    //Checking for any error so that app does not crash
    catch(err){
        success = false
        console.log(err)
        res.json({success , error: "some error occurred"})
    }
};


exports.login = async (req , res) => {
    let success;
    try{
        const { email , password } = req.body;
        // Check if all details are provided
        if ( !email || !password ) {
            success = false
            return res.status(403).json({success , error: "All fields are required"})
        }

        //creating a boolean variable to check if the user is already present or not
        let user = await User.findOne({ email });
        
        //if present, show the error message
        if(!user){
            success = false
            return res.status(400).json({success , error: "Please try to login using correct credentials"})
        }
        
        //bcrypt function used to validate the password
        const passwordCompare = await bcrypt.compare(password , user.password)
        
        //if password does not match
        if(!passwordCompare){
            success = false
            return res.status(400).json({success , error: "Please try to login using correct credentials"})
        }

        //Creating a data object that is to be given to the server for autherozing the user
        const data = {
            user:{
                id: user.id
            }
        }
        const userId = user.id

        //Generating a JWT token
        var authToken = jwt.sign(data, JWT_Secret)

        //giving back response
        success = true
        res.json({success , authToken , userId })

    }
    //Checking for any error so that app does not crash
    catch(err){
        console.log(err)
        success = false
        res.json({success , error: "some error occurred"})
    }
};


exports.getUser = async (req, res) => {
    let success;
    try {
        
        //making a constant varible to store the id of user
        const userId = req.user.id;

        //creating a json object to check if the user is already present or not, it select all the things apart from password
        const user = await User.findById(userId).select("-password");
        
        //if not present, show the error message
        if(!user){
            success = false
            return res.status(400).json({success , error: "Please try to login using correct credentials"})
        }

        //giving the user back in the response
        success = true
        res.status(200).json({success , user})

    } catch (error) {
      console.log(error.message);
      success = false
      return res.status(500).json({success ,  error: error.message });
    }
};


exports.getUserWithId = async (req , res) => {
    let success;
    try {
        
        //making a constant varible to store the id of user
        const userId = req.params.id;

        //creating a json object to check if the user is already present or not, it select all the things apart from password
        const user = await User.findById(userId).select("-password");
        
        //if not present, show the error message
        if(!user){
            success = false
            return res.status(400).json({success , error: "Please try to login using correct credentials"})
        }

        //giving the user back in the response
        success = true
        res.status(200).json({success , user})

    } catch (error) {
      console.log(error.message);
      success = false
      return res.status(500).json({success ,  error: error.message });
    }
};



exports.uploadProfilePic = async (req , res) => {
    let success = false
    try{

        const { image  } = req.body
        if(image === 'null') {
            return res.status(400).json({success , error: "Please Upload Image"})
        }

        let user = await User.findOne({ _id: req.user.id })
        if(user){
            user.profile_image = req.file.filename
            await user.save()
        }

        //console.log(req.body)

        success = true
        res.status(200).json({success , imageName: req.file.filename , message: "Image Uploaded"})
    } catch (error) {
        console.error(error)
        res.status(500).json({success , error: "Error while uploading profile"})
    }
}



exports.editProfile = async (req , res) => {
    let success = false
    try{

        const { name } = req.body
        if(name === ''){
            return res.status(400).json({success , error: "Please Provide Name"})
        }

        if(name.length < 4){
            return res.status(400).json({success , error: "Name should have atleast four characters"})
        }

        const startsWithAlphabetRegex = /^[a-zA-Z]/;
        if (!startsWithAlphabetRegex.test(name)) {
            return res.status(400).json({ success, error: "Name must start with an alphabet character" });
        }

        //console.log(name)
        let user = await User.findOne({ _id: req.user.id });
        user.name = name
        await user.save()
        success = true
        res.status(200).json({success , message: "Profile Edited"})

    } catch (error) {
        console.error(error)
        res.status(500).json({success , error: "Error while editing profile"})
    }
}


