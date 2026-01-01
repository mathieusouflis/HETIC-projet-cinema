---
description: Get the Cinema API up and running in 5 minutes - from clone to first API call
---

# Quick Start

Get the Cinema API running locally in just a few minutes. This guide will have you making API calls and exploring the codebase quickly.

## ⚡ 5-Minute Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd HETIC-projet-cinema

# Install dependencies
pnpm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit basic settings (use your preferred editor)
nano .env
```

**Minimal `.env` configuration:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_DATABASE=cinema_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API
NODE_ENV=development
BACKEND_PORT=3000
```

### 3. Database Setup
```bash
# Start PostgreSQL (if using Docker)
pnpm db:start

# Or create database manually
createdb cinema_dev

# Run migrations
cd apps/api && pnpm db:migrate
```

### 4. Start the API
```bash
# Development mode with hot reload
cd apps/api && pnpm dev
```

You should see:
```
✅ PostgreSQL client connected
🚀 Server running on http://localhost:3000
```

## 🧪 Test Your Setup

### Health Check
```bash
curl http://localhost:3000/api/v1
```

**Expected Response:**
```json
{
  "message": "API v1 is up and running!",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/v1/auth",
    "users": "/api/v1/users"
  }
}
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "test@example.com",
      "username": "testuser",
      "avatar": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Access Protected Route
```bash
# Use the accessToken from previous response
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📁 Project Overview

### Key Directories
```
apps/api/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   └── users/        # User management
│   ├── shared/           # Shared utilities
│   └── database/         # Database config
├── package.json
└── drizzle.config.ts     # Database ORM config
```

### Available Scripts
```bash
# Development
pnpm dev              # Start with hot reload
pnpm build           # Compile TypeScript
pnpm start           # Start production server

# Database
pnpm db:generate     # Generate migrations
pnpm db:migrate      # Apply migrations
pnpm db:push         # Push schema changes
pnpm db:studio       # Open database GUI

# Quality
pnpm test            # Run tests
pnpm lint            # Check code style
pnpm type-check      # Validate TypeScript
```

## 🔧 Development Tools

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

### API Testing with Postman
Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Cinema API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"username\": \"testuser\",\n  \"password\": \"Password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"Password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

## 🚨 Common Issues

### Port 3000 Already in Use
```bash
# Find what's using the port
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use a different port
BACKEND_PORT=3001 pnpm dev
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Check connection details
psql -h localhost -U postgres -d cinema_dev

# Reset database if needed
dropdb cinema_dev && createdb cinema_dev
pnpm db:migrate
```

### TypeScript Errors
```bash
# Clear cache and rebuild
rm -rf dist node_modules/.cache
pnpm clean && pnpm build
```

### Permission Denied (macOS/Linux)
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

## 📚 Understanding the Code

### Request Flow Example
When you call `POST /api/v1/auth/register`:

```mermaid
graph LR
    A[HTTP Request] --> B[Express Router]
    B --> C[Validation Middleware]
    C --> D[Auth Controller]
    D --> E[Register Use Case]
    E --> F[User Repository]
    F --> G[PostgreSQL]
```

1. **Express Router** - Routes to auth module
2. **Validation Middleware** - Validates request body with Zod
3. **Auth Controller** - Handles HTTP specifics
4. **Register Use Case** - Contains business logic
5. **User Repository** - Database operations
6. **PostgreSQL** - Data persistence

### Key Files to Explore

```typescript
// Main entry point
src/index.ts

// Module setup and routing
src/modules/index.ts

// Authentication use case
src/modules/auth/application/use-cases/Register.usecase.ts

// User entity (business logic)
src/modules/users/domain/entities/user.entity.ts

// Database schema
src/modules/users/infrastructure/database/schemas/users.schema.ts
```

## 🎯 Next Steps

Now that you have the API running:

### Explore the Architecture
- **[Architecture Overview](../architecture/README.md)** - Understand the system design
- **[Clean Architecture](../architecture/clean-architecture.md)** - Learn the principles
- **[Project Structure](../architecture/project-structure.md)** - Navigate the codebase

### Start Developing
- **[Development Guide](development-guide.md)** - Daily development workflow
- **[Creating a Module](creating-module.md)** - Add new features
- **[Writing Tests](writing-tests.md)** - Test your code

### Dive Deeper
- **[API Reference](../reference/README.md)** - Complete endpoint documentation
- **[Examples](../examples/README.md)** - Practical code examples

## 💡 Pro Tips

### Hot Reload Development
The API automatically restarts when you make changes. Watch the console for:
```
🔄 Restarting due to changes...
✅ PostgreSQL client connected
🚀 Server running on http://localhost:3000
```

### Database GUI
Open Drizzle Studio to visually explore your database:
```bash
pnpm db:studio
# Opens http://localhost:4983
```

### Environment Switching
Use different `.env` files for different environments:
```bash
# Development (default)
pnpm dev

# Production
NODE_ENV=production pnpm start

# Testing
NODE_ENV=test pnpm test
```

### Quick Database Reset
Reset everything and start fresh:
```bash
# Stop server, reset DB, restart
pnpm db:reset && pnpm dev
```

## ✅ Success Checklist

- [ ] API server starts without errors
- [ ] Health check endpoint responds
- [ ] User registration works
- [ ] User login returns tokens
- [ ] Protected routes accept JWT tokens
- [ ] Database contains user data
- [ ] Hot reload works when editing files

Congratulations! 🎉 You now have a fully functional Cinema API running locally. Ready to start building amazing features!

**Next recommended read**: [Development Guide](development-guide.md)