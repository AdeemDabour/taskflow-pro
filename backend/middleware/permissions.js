// middleware/permissions.js

// Check if user is workspace owner
const isOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only workspace owners can perform this action.'
    });
  }
  next();
};

// Check if user is owner or admin
const isOwnerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Requires owner or admin role.'
    });
  }
  next();
};

// Check if user can modify a specific task
const canModifyTask = async (req, res, next) => {
  try {
    const Task = require('../models/Task');
    
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.workspaceId
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Owner and admin can modify any task
    if (req.user.role === 'owner' || req.user.role === 'admin') {
      req.task = task;  // Attach task to request
      return next();
    }
    
    // Members can only modify their own tasks or tasks assigned to them
    if (
      task.createdBy.toString() === req.user._id.toString() ||
      task.assignedTo?.toString() === req.user._id.toString()
    ) {
      req.task = task;
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to modify this task'
    });
    
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking permissions',
      error: error.message
    });
  }
};

module.exports = {
  isOwner,
  isOwnerOrAdmin,
  canModifyTask
};