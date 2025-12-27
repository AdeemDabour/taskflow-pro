// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId)
      .populate('workspace', 'name slug isActive');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if workspace is active
    if (!user.workspace.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Workspace is deactivated'
      });
    }

    // Attach user and workspace to request
    req.user = user;
    req.workspaceId = user.workspace._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

module.exports = auth;