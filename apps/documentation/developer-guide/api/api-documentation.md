---
description: >-
  Comprehensive overview of the Cinema API architecture, features, and
  capabilities
---

# 🎯 API Overview

Welcome to the **Cinema API** documentation! This API provides a robust backend service for a community-driven cinema platform with real-time watch party synchronization capabilities.

## 🎯 What is Cinema API?

The Cinema API is a **Node.js/Express** backend service designed to power a cinema community platform. It provides:

* **User Management** - Registration, authentication, and profile management
* **Authentication** - JWT-based auth with refresh tokens
* **Real-time Features** - WebSocket support for watch party synchronization
* **Extensible Architecture** - Clean, modular design following SOLID principles

## 🏗️ Architecture Highlights

### Clean Architecture

Built following **Clean Architecture** principles with clear separation of concerns:

* **Domain Layer** - Business logic and entities
* **Application Layer** - Use cases and orchestration
* **Infrastructure Layer** - Data access and external services
* **Presentation Layer** - HTTP controllers and routes

### Modular Design

Each feature is organized as a **self-contained module**:

```
modules/
├── users/          # User management
├── auth/           # Authentication
└── [future]/       # Films, watchparty, etc.
```

### Type-Safe Development

* **TypeScript** throughout the entire codebase
* **Zod** for runtime validation
* **Drizzle ORM** for type-safe database operations

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Start database
pnpm db:start

# Run migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The API will be available at `http://localhost:3000`

## 📡 Core Features

### Authentication & Authorization

* **JWT Tokens** - Secure access and refresh tokens
* **Password Hashing** - bcrypt with configurable salt rounds
* **Role-based Access** - Middleware for authorization
* **Token Refresh** - Automatic token rotation for security

### User Management

* **Registration** - Create new user accounts
* **Profile Management** - Update user information
* **Validation** - Comprehensive input validation
* **Error Handling** - Consistent error responses

### Database Integration

* **PostgreSQL** - Primary database
* **Drizzle ORM** - Type-safe database operations
* **Migrations** - Version-controlled schema changes
* **Connection Pooling** - Optimized database connections

### Development Experience

* **Hot Reload** - Automatic server restart during development
* **Type Safety** - Full TypeScript coverage
* **Error Handling** - Comprehensive error middleware
* **Logging** - Structured logging with Morgan

## 🛡️ Security Features

* **Password Hashing** - bcrypt with salt rounds
* **JWT Security** - Signed tokens with expiration
* **Input Validation** - Zod schema validation
* **CORS Protection** - Configurable CORS policies
* **Rate Limiting** - Built-in rate limiting middleware
* **Security Headers** - Helmet.js security headers

## 🎨 Design Principles

### SOLID Principles

* **Single Responsibility** - Each class has one job
* **Open/Closed** - Open for extension, closed for modification
* **Liskov Substitution** - Interfaces can be substituted
* **Interface Segregation** - Small, focused interfaces
* **Dependency Inversion** - Depend on abstractions

### Best Practices

* **Dependency Injection** - Constructor injection pattern
* **Error Handling** - Consistent error responses
* **Validation** - Input validation at API boundary
* **Type Safety** - TypeScript throughout
* **Testing** - Comprehensive test coverage
* **Documentation** - Self-documenting code
