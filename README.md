# TaskFlow Pro

> Multi-tenant team collaboration platform built with Node.js, Express, and MongoDB

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/cloud/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Features

### ✅ Implemented
- [x] **Multi-tenant architecture** - Complete workspace isolation
- [x] **User authentication** - JWT-based secure auth
- [x] **Workspace management** - Auto-created on registration
- [x] **Password hashing** - bcrypt security
- [x] **Protected routes** - Middleware-based authorization

### 🚧 In Progress
- [ ] Task management with real-time updates
- [ ] Team collaboration features
- [ ] Role-based permissions
- [ ] File attachments
- [ ] Activity tracking
- [ ] Email notifications

## 🛠️ Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled
- Socket.io (planned for real-time)

**Security:**
- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes
- Workspace data isolation

## 📦 Project Structure
```
taskflow-pro/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User model with workspace link
│   │   └── Workspace.js       # Multi-tenant workspace model
│   ├── routes/
│   │   └── auth.js            # Authentication routes
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── utils/                 # Utility functions (planned)
│   ├── .env                   # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js              # Entry point
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
cd taskflow-pro/backend
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

### Example Requests

**Register:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "secure123",
  "workspaceName": "My Company"
}
```

**Login:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "secure123"
}
```

**Get Current User (Protected):**
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🎯 Development Status

### ✅ Phase 1: Foundation (Week 1) - **COMPLETE**
- [x] Project structure & setup
- [x] MongoDB Atlas connection
- [x] Environment configuration
- [x] Basic Express server

### ✅ Phase 2: Multi-Tenant Auth (Week 1) - **COMPLETE**
- [x] Workspace model (tenant isolation)
- [x] User model with workspace link
- [x] Registration (creates user + workspace)
- [x] Login with workspace context
- [x] JWT tokens with workspaceId
- [x] Auth middleware
- [x] Protected routes

### 🚧 Phase 3: Task System (Week 2) - **IN PROGRESS**
- [ ] Task model with workspace filtering
- [ ] Task CRUD operations
- [ ] Assign tasks to team members
- [ ] Task status & priority
- [ ] Automatic tenant isolation

### 📅 Phase 4: Advanced Features (Week 3-4) - **PLANNED**
- [ ] Real-time updates (Socket.io)
- [ ] File attachments
- [ ] Comments system
- [ ] Activity logging
- [ ] Email notifications

### 📅 Phase 5: Polish & Deploy (Week 5-6) - **PLANNED**
- [ ] Comprehensive testing
- [ ] API documentation
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment

## 🏗️ Architecture Highlights

### Multi-Tenancy Pattern
```javascript
// Every user belongs to a workspace
User → Workspace (tenant)

// JWT token contains workspace context
{
  userId: "...",
  workspaceId: "..."  // ← Automatic tenant isolation
}

// All queries automatically filtered by workspace
Task.find({ workspaceId: req.user.workspaceId })
```

### Data Isolation
- Single database, multiple tenants
- Workspace-based data separation
- Automatic filtering via middleware
- Secure by design

## 📚 Documentation

- [API Documentation](./docs/API.md) (Coming soon)
- [Architecture Guide](./docs/ARCHITECTURE.md) (Coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) (Coming soon)

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token expiration (7 days default)
- ✅ Protected API routes
- ✅ Workspace data isolation
- ✅ Input validation
- ✅ CORS configuration
- 🚧 Rate limiting (planned)
- 🚧 Request sanitization (planned)

## 🚀 Deployment

*Deployment guide coming in Week 3-4*

Planned platforms:
- Railway (primary)
- Render (alternative)
- AWS/DigitalOcean (production)

## 👨‍💻 Author

**Adeem**
- 🎯 Building production-ready SaaS platform
- 🇮🇱 Targeting Israeli tech market
- 💼 Showcasing enterprise Node.js skills

## 🤝 Contributing

This is a portfolio project, but feedback is welcome!

## 📄 License

MIT License - feel free to use this for learning!

## 🎯 Project Goals

Built to demonstrate:
- ✅ Multi-tenant SaaS architecture
- ✅ Secure authentication systems
- ✅ Scalable backend design
- ✅ Production-ready code quality
- ✅ MongoDB best practices
- ✅ RESTful API design

**Perfect for Israeli tech companies seeking skilled Node.js developers!** 🇮🇱

## 📊 Progress
```
Week 1: ████████████████████ 100% (Auth & Multi-tenancy)
Week 2: ██░░░░░░░░░░░░░░░░░░  10% (Task System)
Week 3: ░░░░░░░░░░░░░░░░░░░░   0% (Advanced Features)
Week 4: ░░░░░░░░░░░░░░░░░░░░   0% (Polish & Deploy)
```

---

**Star ⭐ this repo if you find it helpful!**