
exports.loadAuth = (req , res) => {
    res.render('auth');
}

exports.successGoogleLogin = (req , res) => {
    if(!req.user)   res.redirect('/failure');
    console.log(req.user)
    res.send("Welcome " + req.user.email)
}

exports.failureGoogleLogin = (req , res) => {
    res.send("Error")
}


const JWT_Secret = process.env.JWT_SECRET
const jwt = require('jsonwebtoken')

exports.reDirect = (req , res) => {
    let success = false;
    try {

        console.log(req.user)
         //Creating a data object that is to be given to the server for autherozing the user
         const data = {
            user:{
                id: req.user.id
            }
        }
        const userId = req.user.id

        //Generating a JWT token
        var authToken = jwt.sign(data, JWT_Secret)

        console.log(authToken)


        success = true;
        return res.status(200).json({ success , message: 'Successfully redirected' , authToken , userId })
    } catch (error) {
        console.error(error)
        res.status(501).json({ success , error: 'Error while redirecting' })
    }
}