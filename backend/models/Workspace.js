// models/Workspace.js
const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    minlength: [2, 'Workspace name must be at least 2 characters'],
    maxlength: [100, 'Workspace name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
    // ✅ Removed 'required' - will be auto-generated
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 10
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate slug from name before validation
workspaceSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    // Convert "Tesla Israel" → "tesla-israel"
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Ensure slug is unique by adding random suffix if needed
workspaceSchema.pre('save', async function(next) {
  if (this.isNew && this.slug) {
    let slugExists = await mongoose.model('Workspace').findOne({ slug: this.slug });
    
    if (slugExists) {
      // Add random number to make it unique
      this.slug = `${this.slug}-${Math.floor(Math.random() * 10000)}`;
    }
  }
  next();
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;