// routes/comments.js
const express = require('express');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { isOwnerOrAdmin } = require('../middleware/permissions');

const router = express.Router();

// All routes require authentication
router.use(auth);

// ===== GET ALL COMMENTS FOR A TASK =====
router.get('/task/:taskId', async (req, res) => {
  try {
    // Verify task exists and belongs to workspace
    const task = await Task.findOne({
      _id: req.params.taskId,
      workspace: req.workspaceId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comments = await Comment.find({
      task: req.params.taskId,
      workspace: req.workspaceId
    })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 }); // Oldest first (like a conversation)

    res.json({
      success: true,
      count: comments.length,
      data: comments
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
});

// ===== CREATE COMMENT =====
router.post('/task/:taskId', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Verify task exists and belongs to workspace
    const task = await Task.findOne({
      _id: req.params.taskId,
      workspace: req.workspaceId
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const comment = new Comment({
      content: content.trim(),
      task: req.params.taskId,
      workspace: req.workspaceId,
      author: req.user._id
    });

    await comment.save();

    // Populate author for response
    await comment.populate('author', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });

  } catch (error) {
    console.error('Create comment error:', error);

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
      message: 'Error creating comment',
      error: error.message
    });
  }
});

// ===== UPDATE COMMENT (Own comments only) =====
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const comment = await Comment.findOne({
      _id: req.params.id,
      workspace: req.workspaceId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only author can edit their comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('author', 'name email role');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
});

// ===== DELETE COMMENT =====
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      workspace: req.workspaceId
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Author can delete their own, Owner/Admin can delete any
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isOwnerOrAdminRole = req.user.role === 'owner' || req.user.role === 'admin';

    if (!isAuthor && !isOwnerOrAdminRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment'
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: comment
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
});

// ===== GET COMMENT COUNT FOR TASK =====
router.get('/task/:taskId/count', async (req, res) => {
  try {
    const count = await Comment.countDocuments({
      task: req.params.taskId,
      workspace: req.workspaceId
    });

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Get comment count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting comment count',
      error: error.message
    });
  }
});

module.exports = router;