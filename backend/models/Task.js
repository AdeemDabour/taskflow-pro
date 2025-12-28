// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  // ✅ CRITICAL: Link to workspace (tenant isolation)
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true  // ← Performance optimization for filtering!
  },
  // ✅ Who created the task
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // ✅ Who is responsible for the task
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // ✅ Tags for organization
  tags: [{
    type: String,
    trim: true
  }],
  // ✅ Completion tracking
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true  // createdAt, updatedAt
});

// ✅ Index for performance (workspace + status queries are common)
taskSchema.index({ workspace: 1, status: 1 });
taskSchema.index({ workspace: 1, assignedTo: 1 });
taskSchema.index({ workspace: 1, createdBy: 1 });

// ✅ Automatically set completedAt when status changes to 'done'
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;