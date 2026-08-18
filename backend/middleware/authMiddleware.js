const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token string (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify the JWT token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      // Move on to the next middleware or controller function
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // Reject request if no token was found in headers
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };