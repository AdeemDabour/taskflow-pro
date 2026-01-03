# TaskFlow Pro API Documentation

**Base URL:** `https://taskflow-pro-production-f430.up.railway.app/`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Auth

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "secure123",
  "workspaceName": "My Company"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@company.com", "role": "owner" },
    "workspace": { "id": "...", "name": "My Company", "slug": "my-company" },
    "token": "eyJhbGc..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "secure123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

---

### Tasks

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer YOUR_TOKEN

Query Parameters:
- status: todo|in-progress|review|done
- priority: low|medium|high|urgent
- assignedTo: userId
- search: search term
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description",
  "priority": "high",
  "dueDate": "2025-01-15",
  "assignedTo": "userId",
  "tags": ["feature", "urgent"]
}
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "done",
  "priority": "low"
}
```

**Permissions:** 
- Members: Can only update their own tasks
- Admins/Owners: Can update any task

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer YOUR_TOKEN
```

#### Get Task Statistics
```http
GET /api/tasks/stats/overview
Authorization: Bearer YOUR_TOKEN
```

---

### Workspaces

#### Get Current Workspace
```http
GET /api/workspaces/current
Authorization: Bearer YOUR_TOKEN
```

#### Get Members
```http
GET /api/workspaces/members
Authorization: Bearer YOUR_TOKEN
```

#### Create Member (Owner only)
```http
POST /api/workspaces/create-member
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "password": "secure123"
}
```

#### Update Member Role (Owner/Admin only)
```http
PATCH /api/workspaces/members/:userId/role
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "role": "admin"
}
```

---

## Role Permissions

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| View tasks | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ | ✅ |
| Update own task | ✅ | ✅ | ✅ |
| Update any task | ✅ | ✅ | ❌ |
| Delete own task | ✅ | ✅ | ✅ |
| Delete any task | ✅ | ✅ | ❌ |
| Manage workspace | ✅ | ❌ | ❌ |
| Promote to admin | ✅ | ❌ | ❌ |

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Error details"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No authentication token, access denied"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to modify this task"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Task not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details"
}
```

---

## Testing with cURL

### Register:
```bash
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "workspaceName": "Test Co"
  }'
```

### Create Task:
```bash
curl -X POST https://your-app.up.railway.app/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My first task",
    "priority": "high"
  }'
```