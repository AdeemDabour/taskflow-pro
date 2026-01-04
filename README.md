# TaskFlow Pro

> Multi-tenant team collaboration platform built with Node.js, Express, and MongoDB

## 🌐 Live Demo

**🚀 API:** https://taskflow-pro-production-f430.up.railway.app/

**Test the API:**
- Health Check: `GET /health`
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Tasks: `POST /api/tasks` (requires auth)
- View API Documentation: [API.md](./API.md)

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/cloud/atlas)
[![Deployed](https://img.shields.io/badge/Deployed-Railway-blueviolet.svg)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Features

### ✅ Implemented (Production Ready!)
- [x] **Multi-tenant architecture** - Complete workspace isolation
- [x] **User authentication** - JWT-based secure auth  
- [x] **Workspace management** - Auto-created on registration
- [x] **Task management system** - Full CRUD operations
- [x] **Role-based permissions** - Owner/Admin/Member roles
- [x] **Team collaboration** - Multi-user workspaces
- [x] **Task assignment** - Assign to team members
- [x] **Status tracking** - Todo, In-Progress, Review, Done
- [x] **Priority management** - Low, Medium, High, Urgent
- [x] **Task statistics** - Dashboard analytics
- [x] **Password hashing** - bcrypt security
- [x] **Protected routes** - Middleware-based authorization
- [x] **Cross-tenant security** - Complete data isolation
- [x] **Production deployment** - Live on Railway
- [x] **Comments system** - Team discussions on tasks
- [x] **Comment permissions** - Edit own, owners delete any
- [x] **Comment editing** - Edit comments with timestamp tracking

### 🚧 Future Enhancements
- [ ] Real-time updates (Socket.io)
- [ ] File attachments
- [ ] Activity logging
- [ ] Email notifications
- [ ] Advanced analytics dashboard

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled
- Deployed on Railway

**Security:**
- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- Protected API routes
- Workspace data isolation
- Role-based access control (RBAC)
- MongoDB injection prevention
- Environment variable protection

## 📦 Project Structure
```
taskflow-pro/
├── config/
│   └── db.js                  # MongoDB connection
├── models/
│   ├── User.js                # User model with workspace link
│   ├── Workspace.js           # Multi-tenant workspace model
│   └── Task.js                # Task model with permissions
│   └── Comment.js             # Comment model for discussions
├── routes/
│   ├── auth.js                # Authentication routes
│   ├── tasks.js               # Task management routes
│   └── workspaces.js          # Workspace management routes
│   └── comments.js            # Comment management routes
├── middleware/
│   ├── auth.js                # JWT verification
│   └── permissions.js         # Role-based access control
├── .env                       # Environment variables
├── .gitignore
├── package.json
├── server.js                  # Entry point
├── API.md                     # API Documentation
└── README.md
```

## 🏁 Getting Started

### Prerequisites
- Node.js v16 or higher
- MongoDB Atlas account (free tier works!)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/taskflow-pro.git
cd taskflow-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow-pro?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

4. **Run development server**
```bash
npm run dev
```

Server will start at `http://localhost:5000`

## 🧪 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register user + create workspace | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks (workspace filtered) | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes (with permissions) |
| DELETE | `/api/tasks/:id` | Delete task | Yes (with permissions) |
| GET | `/api/tasks/stats/overview` | Get task statistics | Yes |

### Workspaces
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/workspaces/current` | Get current workspace | Yes |
| GET | `/api/workspaces/members` | Get workspace members | Yes |
| POST | `/api/workspaces/create-member` | Add team member | Yes (Owner only) |
| PUT | `/api/workspaces/settings` | Update workspace | Yes (Owner only) |
| PATCH | `/api/workspaces/members/:id/role` | Update member role | Yes (Owner/Admin) |

### Comments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/comments/task/:taskId` | Get all comments on task | Yes |
| POST | `/api/comments/task/:taskId` | Add comment to task | Yes |
| PUT | `/api/comments/:id` | Edit own comment | Yes (Author only) |
| DELETE | `/api/comments/:id` | Delete comment | Yes (Author/Owner/Admin) |
| GET | `/api/comments/task/:taskId/count` | Get comment count | Yes |

**Full API documentation:** [API.md](./API.md)

## 🎯 Development Journey

### ✅ Week 1: Foundation & Multi-Tenant Auth - **COMPLETE**
- [x] Project structure & setup
- [x] MongoDB Atlas connection
- [x] Environment configuration
- [x] Basic Express server
- [x] Workspace model (tenant isolation)
- [x] User model with workspace link
- [x] Registration (creates user + workspace)
- [x] Login with workspace context
- [x] JWT tokens with workspaceId
- [x] Auth middleware
- [x] Protected routes

### ✅ Week 2: Task System & Permissions - **COMPLETE**
- [x] Task model with workspace filtering
- [x] Task CRUD operations
- [x] Assign tasks to team members
- [x] Task status & priority
- [x] Automatic tenant isolation
- [x] Role-based permissions (Owner/Admin/Member)
- [x] Permission middleware
- [x] Workspace management routes
- [x] Task statistics endpoint
- [x] Production deployment to Railway
- [x] Comments system with full CRUD
- [x] Comment permissions (author edit, owner/admin delete)

### 📅 Future Phases - **PLANNED**
- [ ] Real-time updates (Socket.io)
- [ ] File attachments
- [ ] Activity logging
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration

## 🏗️ Architecture Highlights

### Multi-Tenancy Pattern
```javascript
// Every user belongs to a workspace (tenant)
User → Workspace

// JWT token contains workspace context
{
  userId: "user_123",
  workspaceId: "workspace_456"  // ← Automatic tenant isolation
}

// All queries automatically filtered by workspace
Task.find({ workspace: req.workspaceId })
```

### Data Isolation
- Single database, multiple tenants
- Workspace-based data separation
- Automatic filtering via middleware
- Secure by design - no cross-tenant access possible

### Role-Based Permissions
```javascript
Owner   → Full control (workspace settings, promote admins)
Admin   → Manage tasks, manage members
Member  → Create tasks, edit own tasks only
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token expiration (7 days default)
- ✅ Protected API routes
- ✅ Workspace data isolation (multi-tenancy)
- ✅ Role-based access control
- ✅ Input validation on all routes
- ✅ CORS configuration
- ✅ MongoDB injection prevention
- ✅ Secure environment variables
- ✅ Production-grade error handling

## 🚀 Deployment

**Live on Railway:** https://taskflow-pro-production-f430.up.railway.app/

**Deployment Features:**
- ✅ Automatic deployments from GitHub
- ✅ Environment variables configured
- ✅ MongoDB Atlas integration
- ✅ Health check endpoint
- ✅ Production-optimized build
- ✅ CORS configured for frontend integration

**Deploy your own:**
1. Fork this repository
2. Create Railway account
3. Connect GitHub repository
4. Add environment variables
5. Deploy!

## 📚 Documentation

- ✅ [API Documentation](./API.md)
- 🚧 Architecture Guide (Coming soon)
- 🚧 Deployment Guide (Coming soon)

## 👨‍💻 Author

**Adeem**
- 🎯 Building production-ready SaaS platforms
- 🇮🇱 Targeting Israeli tech market
- 💼 Showcasing enterprise Node.js skills
- 🚀 Available for backend developer positions

## 🤝 Contributing

This is a portfolio project, but feedback and suggestions are welcome!

## 📄 License

MIT License - feel free to use this for learning!

## 🎯 Project Goals

This project demonstrates:
- ✅ Multi-tenant SaaS architecture
- ✅ Secure authentication systems
- ✅ Role-based access control
- ✅ Scalable backend design
- ✅ Production-ready code quality
- ✅ MongoDB best practices
- ✅ RESTful API design
- ✅ Professional deployment practices

**Perfect portfolio project for Israeli tech companies seeking skilled Node.js developers!** 🇮🇱

## 📊 Project Status
```
Foundation:        ████████████████████ 100% ✅
Authentication:    ████████████████████ 100% ✅
Multi-Tenancy:     ████████████████████ 100% ✅
Task Management:   ████████████████████ 100% ✅
Permissions:       ████████████████████ 100% ✅
Deployment:        ████████████████████ 100% ✅
Real-time:         ░░░░░░░░░░░░░░░░░░░░   0%
Advanced Features: ░░░░░░░░░░░░░░░░░░░░   0%

Overall Progress:  █████████████░░░░░░░ 65%
```

## 🎉 Key Achievements

- 🏆 Built complete multi-tenant SaaS backend
- 🔐 Implemented enterprise-level security
- 🚀 Successfully deployed to production
- 📊 Full CRUD operations with permissions
- 👥 Team collaboration features
- ⚡ Production-grade error handling
- 📝 Comprehensive API documentation
- 💬 Team discussion features via comments

---

**⭐ Star this repo if you find it helpful!**

**🔗 Live Demo:** https://taskflow-pro-production-f430.up.railway.app/

**📧 Contact:** [www.linkedin.com/in/adeem-dabour]
