
require("dotenv").config()

//importing jwt
const jwt = require('jsonwebtoken')

//making a JWT_Secret as a signature
const JWT_Secret = process.env.JWT_SECRET;

//creating a middleware function which is designed to perform some function
const fetchuser = (req , res , next) => {
    
    let success = false

    //storing token present in the auth-token header in thunderclient
    const token = req.header('auth-token')

    //if token is not present
    if(!token){
        res.status(401).send({success , error: "Try to use with the correct authentication token"})
    }

    //getting the userdata with the try catch block
    try{
        //verify the token with the JWT_Secret and store the data
        const data = jwt.verify(token , JWT_Secret)

        //storing the user data in req.user
        req.user = data.user
        success = true
        //Calling the function next to middleware
        next()
    }
    
    //Error Handling
    catch(err) {
        res.status(401).send({success , error: "Try to use with the correct authentication token"})
    }

}

//exporting the module fetchuser function
module.exports = fetchuser

