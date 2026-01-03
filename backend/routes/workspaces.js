// routes/workspaces.js
const express = require('express');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { isOwner, isOwnerOrAdmin } = require('../middleware/permissions');

const router = express.Router();

// All routes require authentication
router.use(auth);

// ===== GET CURRENT WORKSPACE =====
router.get('/current', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.workspaceId)
      .populate('owner', 'name email')
      .populate('members', 'name email role');
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }
    
    res.json({
      success: true,
      data: workspace
    });
    
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workspace',
      error: error.message
    });
  }
});

// ===== GET WORKSPACE MEMBERS =====
router.get('/members', async (req, res) => {
  try {
    const members = await User.find({
      workspace: req.workspaceId,
      isActive: true
    }).select('name email role createdAt');
    
    res.json({
      success: true,
      count: members.length,
      data: members
    });
    
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching members',
      error: error.message
    });
  }
});
// ===== TEMPORARY: CREATE TEST MEMBER (REMOVE IN PRODUCTION!) =====
router.post('/create-test-member', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Only owner can create members
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only owners can create test members'
      });
    }
    
    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Create member in same workspace
    const member = new User({
      name,
      email,
      password,
      workspace: req.workspaceId,  // ← Same workspace as owner!
      role: 'member'  // ← Set as member!
    });
    
    await member.save();
    
    // Add to workspace members
    const workspace = await Workspace.findById(req.workspaceId);
    workspace.members.push(member._id);
    await workspace.save();
    
    res.status(201).json({
      success: true,
      message: 'Test member created',
      data: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        workspace: workspace.name
      }
    });
    
  } catch (error) {
    console.error('Create test member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test member',
      error: error.message
    });
  }
});

// ===== UPDATE WORKSPACE (Owner only) =====
router.put('/settings', isOwner, async (req, res) => {
  try {
    const { name, settings } = req.body;
    
    const workspace = await Workspace.findById(req.workspaceId);
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }
    
    if (name) workspace.name = name;
    if (settings) {
      if (settings.allowInvites !== undefined) {
        workspace.settings.allowInvites = settings.allowInvites;
      }
      if (settings.maxMembers) {
        workspace.settings.maxMembers = settings.maxMembers;
      }
    }
    
    await workspace.save();
    
    res.json({
      success: true,
      message: 'Workspace updated successfully',
      data: workspace
    });
    
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workspace',
      error: error.message
    });
  }
});

// ===== UPDATE MEMBER ROLE (Owner/Admin only) =====
router.patch('/members/:userId/role', isOwnerOrAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "member" or "admin"'
      });
    }
    
    const user = await User.findOne({
      _id: req.params.userId,
      workspace: req.workspaceId
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in this workspace'
      });
    }
    
    // Cannot change owner role
    if (user.role === 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change owner role'
      });
    }
    
    // Only owner can promote to admin
    if (role === 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owner can promote users to admin'
      });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
});

module.exports = router;