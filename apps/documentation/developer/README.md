---
description: >-
  Complete developer guide for the Cinema project - setup, workflows, and best
  practices
---

# 👨‍💻 Developer Overview

Welcome to the **Cinema Project** developer documentation! This guide will help you get up and running with our development environment and understand our workflows, tools, and best practices.

## 🎯 What You'll Find Here

This developer section covers everything you need to contribute effectively to the Cinema project:

* **Environment Setup** - Get your development environment ready
* **Tools & Configuration** - IDE setup, extensions, and productivity tools
* **Development Workflows** - Git workflows, testing, and deployment
* **Best Practices** - Code standards, patterns, and conventions

## 🏗️ Project Architecture

The Cinema project is built as a **Turborepo monorepo** with the following structure:

```
HETIC-projet-cinema/
├── apps/
│   ├── api/           # Express.js Backend (Node.js + TypeScript)
│   ├── front/         # Next.js Frontend (React + TypeScript)
│   └── documentation/ # GitBook Documentation
├── packages/
│   ├── ui/            # Shared React Component Library
│   ├── eslint-config/ # Shared ESLint Rules
│   ├── typescript-config/ # Shared TypeScript Configuration
│   └── logger/        # Shared Logging Utilities
└── docs/              # Additional Documentation
```

## 🛠️ Technology Stack

### Core Technologies

* **TypeScript** - Primary language across all apps
* **Node.js 20+** - Runtime environment
* **pnpm** - Package manager and workspace management
* **Turborepo** - Monorepo build system

### Frontend Stack

* **Next.js 14** - React framework with App Router
* **React** - UI library
* **Tailwind CSS** - Utility-first CSS framework
* **React Query** - Server state management

### Backend Stack

* **Express.js** - Web framework
* **PostgreSQL** - Primary database
* **Drizzle ORM** - Type-safe database operations
* **Zod** - Runtime validation
* **JWT** - Authentication
* **SWAGGER** - Documentation

### Development Tools

* **ESLint** - Code linting
* **Prettier** - Code formatting
* **Husky** - Git hooks
* **lint-staged** - Pre-commit linting
* **Vitest** - Testing framework
* **Docker** - Containerization

## 🚀 Quick Start for Developers

### Prerequisites

Make sure you have these installed:

* **Node.js 20+** ([Download](https://nodejs.org/))
* **pnpm** (`npm install -g pnpm`)
* **Git** ([Download](https://git-scm.com/))
* **Docker** ([Download](https://docker.com/)) - for database
* **PostgreSQL** (via Docker or local install)

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/mathieusouflis/HETIC-projet-cinema.git
cd HETIC-projet-cinema

# 2. Install dependencies
pnpm install

# 3. Configure your environment variables
# Edit the .env files with your settings

# 4. Start the database
pnpm db:start

# 5. Run database migrations
pnpm db:migrate

# 6. Start all applications
pnpm dev
```

### Verify Installation

After setup, you should be able to access:

* **API**: http://localhost:3000/status
* **API Documentation** (if enabled): http://localhost:3000/docs

## 📋 Development Workflows

### Daily Development

```bash
# Start development servers
pnpm dev

# Run specific app
pnpm dev:api     # Start only API (not working for now)
pnpm dev:front   # Start only frontend (not working for now)

# Run tests
pnpm test        # All tests
pnpm test:api    # API tests only (⚠️ not working for now)
pnpm test:front  # Frontend tests only (⚠️ not working for now)

# Linting and formatting
pnpm lint        # Lint all code
pnpm format      # Format all code
```

### Database Operations

```bash
# Database management
pnpm db:start    # Start PostgreSQL container
pnpm db:stop     # Stop database
pnpm db:reset    # Reset database (destructive) (⚠️ not working for now)

# Migrations
pnpm db:migrate  # Run pending migrations
pnpm db:studio   # Open Drizzle Studio
```

### Building and Testing

```bash
# Build all applications
pnpm build

# Build specific app
pnpm build:api # (⚠️ not working for now)
pnpm build:front # (⚠️ not working for now)

# Run all tests with coverage
pnpm test:coverage

# Type checking
pnpm type-check
```

## 🔧 Recommended Tools

### IDE Setup

* **VS Code** (recommended) with extensions:
  * TypeScript Hero
  * ESLint
  * Prettier
  * GitLens
  * Tailwind CSS IntelliSense

### Browser Extensions

* **React Developer Tools**
* **Redux DevTools** (if using Redux)

### Command Line Tools

* **Git** with configured aliases
* **Docker Desktop**
* **Postman** or **Insomnia** for API testing

## 🧪 Testing Strategy

### Testing Philosophy

* **Unit Tests** - Individual functions and components
* **Integration Tests** - API endpoints and database operations
* **E2E Tests** - Critical user workflows

### Testing Tools

* **Vitest** - Unit and integration testing
* **Testing Library** - React component testing
* **Supertest** - API endpoint testing

### Test Structure

```typescript
// Example test file: user.test.ts
import { describe, it, expect } from 'vitest';
import { createUser } from './user.service';

describe('User Service', () => {
  it('should create a new user', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const user = await createUser(userData);
    
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(userData.email);
  });
});
```

## 📚 Key Concepts

### Monorepo Benefits

* **Shared Code** - Reuse components, utilities, and configurations
* **Consistent Tooling** - Same ESLint, TypeScript configs everywhere
* **Coordinated Releases** - Deploy related changes together
* **Developer Experience** - Single setup for entire project

### Clean Architecture (API)

* **Domain Layer** - Business logic and entities
* **Application Layer** - Use cases and orchestration
* **Infrastructure Layer** - Database, external services
* **Presentation Layer** - HTTP routes and controllers

### Component Architecture (Frontend)

* **Atomic Design** - Atoms, molecules, organisms, templates
* **Container/Presentational** - Smart vs. dumb components
* **Custom Hooks** - Reusable stateful logic
* **Context API** - Global state management

## 🚨 Common Issues & Solutions

### Database Connection Issues

```bash
# Restart database container
pnpm db:stop
pnpm db:start

# Check container status
docker ps
```

### pnpm Installation Issues

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## 📖 Next Steps

Now that you have an overview, dive deeper into specific topics:

1. [**Tools & Setup**](tools-and-setup/) - Detailed environment configuration
2. [**API Documentation**](../developer-guide/api/api-documentation.md) - Backend development guide
3. [**Contributing Guidelines**](../developer-guide/guidelines/) - How to contribute code

## 🤝 Getting Help

* **Documentation** - Check this GitBook first
* **Team Chat** - Ask questions in development channels
* **Code Reviews** - Learn from pull request feedback
* **Pair Programming** - Work with senior developers

***

**Ready to start coding?** Head to [Tools & Setup](tools-and-setup/) for detailed environment configuration, or jump straight into the [API Documentation](../developer-guide/api/api-documentation.md) to understand the backend architecture.
