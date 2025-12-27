// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const router = express.Router();

// Helper function to generate JWT
const generateToken = (userId, workspaceId) => {
  return jwt.sign(
    { userId, workspaceId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// ===== REGISTER (Creates User + Workspace) =====
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, workspaceName } = req.body;

    // Validation
    if (!name || !email || !password || !workspaceName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Step 1: Create workspace first (without owner)
    const workspace = new Workspace({
      name: workspaceName,
      owner: new mongoose.Types.ObjectId() // Temporary, will update
    });

    await workspace.save();

    // Step 2: Create user with workspace
    const user = new User({
      name,
      email,
      password,
      workspace: workspace._id,
      role: 'owner'  // First user is owner
    });

    await user.save();

    // Step 3: Update workspace with real owner and add to members
    workspace.owner = user._id;
    workspace.members = [user._id];
    await workspace.save();

    // Generate token
    const token = generateToken(user._id, workspace._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        workspace: {
          id: workspace._id,
          name: workspace.name,
          slug: workspace.slug
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email })
      .select('+password')
      .populate('workspace', 'name slug');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Contact your administrator.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if workspace is active
    if (!user.workspace.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Workspace is deactivated. Contact support.'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.workspace._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        workspace: {
          id: user.workspace._id,
          name: user.workspace.name,
          slug: user.workspace.slug
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

module.exports = router;