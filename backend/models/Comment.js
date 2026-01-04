// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
    index: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for performance
commentSchema.index({ task: 1, createdAt: -1 });
commentSchema.index({ workspace: 1, task: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;