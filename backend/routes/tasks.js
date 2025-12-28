// routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// ✅ All routes require authentication
router.use(auth);

// ===== GET ALL TASKS (with automatic workspace filtering!) =====
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignedTo, search } = req.query;
    
    // ✅ CRITICAL: Always filter by workspace!
    const filter = { workspace: req.workspaceId };
    
    // Optional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });  // Newest first
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// ===== GET SINGLE TASK =====
router.get('/:id', async (req, res) => {
  try {
    // ✅ CRITICAL: Filter by workspace to prevent cross-tenant access!
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.workspaceId  // ← Security!
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: task
    });
    
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
});

// ===== CREATE TASK =====
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, tags } = req.body;
    
    // Validate assigned user belongs to same workspace
    if (assignedTo) {
      const assignedUser = await User.findOne({
        _id: assignedTo,
        workspace: req.workspaceId
      });
      
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign task to user outside your workspace'
        });
      }
    }
    
    // ✅ Create task with workspace automatically set!
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      tags,
      workspace: req.workspaceId,  // ← Auto from middleware!
      createdBy: req.user._id
    });
    
    await task.save();
    
    // Populate for response
    await task.populate('createdBy', 'name email');
    await task.populate('assignedTo', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
    
  } catch (error) {
    console.error('Create task error:', error);
    
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
      message: 'Error creating task',
      error: error.message
    });
  }
});

// ===== UPDATE TASK =====
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;
    
    // Find task (with workspace filter!)
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
    
    // Validate assigned user if changing
    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      const assignedUser = await User.findOne({
        _id: assignedTo,
        workspace: req.workspaceId
      });
      
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign task to user outside your workspace'
        });
      }
    }
    
    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (tags) task.tags = tags;
    
    await task.save();
    
    // Populate for response
    await task.populate('createdBy', 'name email');
    await task.populate('assignedTo', 'name email');
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
    
  } catch (error) {
    console.error('Update task error:', error);
    
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
      message: 'Error updating task',
      error: error.message
    });
  }
});

// ===== DELETE TASK =====
router.delete('/:id', async (req, res) => {
  try {
    // ✅ CRITICAL: Workspace filter prevents deleting other company's tasks!
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      workspace: req.workspaceId
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    });
    
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// ===== GET TASK STATISTICS =====
router.get('/stats/overview', async (req, res) => {
  try {
    // All stats filtered by workspace!
    const stats = await Task.aggregate([
      { $match: { workspace: req.workspaceId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          review: {
            $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] }
          },
          done: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          urgent: {
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
      highPriority: 0,
      urgent: 0
    };
    
    // Calculate completion rate
    const completionRate = result.total > 0
      ? ((result.done / result.total) * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      data: {
        ...result,
        completionRate: `${completionRate}%`
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;