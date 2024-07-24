
const User = require("../Models/userModel")
let success = false
const authorizeUser = (requiredRole) => async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (user.role !== requiredRole) {
        return res.status(403).json({success , error: 'Access Denied' });
      }
      success = true
      next();
    } catch (error) {
      console.error('Error authorizing user:', error);
      res.status(500).json({success , error: 'An error occurred while authorizing the user' });
    }
};

module.exports = authorizeUser


