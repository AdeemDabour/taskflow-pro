// routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { isOwnerOrAdmin, canModifyTask } = require('../middleware/permissions');

const router = express.Router();

// ✅ All routes require authentication
router.use(auth);

// ===== GET ALL TASKS (Everyone can view) =====
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignedTo, search } = req.query;
    
    const filter = { workspace: req.workspaceId };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tasks = await Task.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });
    
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

// ===== GET SINGLE TASK (Everyone can view) =====
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.workspaceId
    })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');
    
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

// ===== CREATE TASK (Everyone can create) =====
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, tags } = req.body;
    
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
    
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      tags,
      workspace: req.workspaceId,
      createdBy: req.user._id
    });
    
    await task.save();
    
    await task.populate('createdBy', 'name email role');
    await task.populate('assignedTo', 'name email role');
    
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

// ===== UPDATE TASK (With permission check!) =====
router.put('/:id', canModifyTask, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, tags } = req.body;
    
    const task = req.task;  // Already loaded by middleware!
    
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
    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (tags) task.tags = tags;
    
    await task.save();
    
    await task.populate('createdBy', 'name email role');
    await task.populate('assignedTo', 'name email role');
    
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

// ===== DELETE TASK (Only owner/admin OR task creator) =====
router.delete('/:id', canModifyTask, async (req, res) => {
  try {
    await req.task.deleteOne();
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: req.task
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

// ===== GET TASK STATISTICS (Everyone can view) =====
router.get('/stats/overview', async (req, res) => {
  try {
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