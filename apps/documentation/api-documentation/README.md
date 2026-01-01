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

## 🔧 Tech Stack

| Category           | Technology  | Purpose                       |
| ------------------ | ----------- | ----------------------------- |
| **Runtime**        | Node.js 20+ | JavaScript runtime            |
| **Framework**      | Express.js  | Web framework                 |
| **Language**       | TypeScript  | Type safety                   |
| **Database**       | PostgreSQL  | Primary database              |
| **ORM**            | Drizzle     | Type-safe database operations |
| **Validation**     | Zod         | Runtime type validation       |
| **Authentication** | JWT         | Token-based auth              |
| **Password**       | bcrypt      | Password hashing              |
| **Testing**        | Vitest      | Unit and integration testing  |
| **Linting**        | ESLint      | Code quality                  |
| **Build**          | tsc         | TypeScript compilation        |

## 📊 API Endpoints Overview

### Authentication (`/api/v1/auth`)

* `POST /register` - Create new account
* `POST /login` - User authentication
* `POST /refresh` - Refresh access token
* `POST /logout` - User logout
* `GET /me` - Current user info

### Users (`/api/v1/users`)

* `GET /` - List users (paginated)
* `GET /me` - Current user profile
* `PATCH /me` - Update own profile
* `GET /:id` - Get user by ID
* `PATCH /:id` - Update user (owner only)
* `DELETE /:id` - Delete user (owner only)

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

## 🔮 Future Roadmap

### Phase 1: Core Features ✅

* [x] User management
* [x] Authentication system
* [x] Database integration
* [x] Basic API structure

### Phase 2: Content Management 🚧

* [ ] Films module
* [ ] Ratings and reviews
* [ ] Watchlist functionality
* [ ] Search and filters

### Phase 3: Social Features 🔮

* [ ] Watch parties
* [ ] Real-time synchronization
* [ ] Chat system
* [ ] Friends system

### Phase 4: Advanced Features 🔮

* [ ] Recommendations engine
* [ ] Notifications system
* [ ] Admin panel
* [ ] Analytics dashboard

## 📚 Documentation Structure

This documentation is organized into several sections:

* **Architecture** - Deep dive into the system design
* **Getting Started** - Setup and installation guides
* **Development Guide** - How to extend and modify the API
* **API Reference** - Detailed endpoint documentation
* **Examples** - Practical usage examples

## 🤝 Contributing

Ready to contribute? Check out our development guides:

1. [Quick Start Guide](guides/quick-start.md) - Get up and running
2. [Creating a Module](../api/guides/creating-module.md) - Add new features
3. [Adding Endpoints](../api/guides/adding-endpoints.md) - Extend existing modules
4. [Writing Tests](../api/guides/writing-tests.md) - Ensure code quality

## 📞 Support

Need help? Here are the best ways to get support:

* **Documentation** - Check this documentation first
* **Issues** - Report bugs or request features
* **Discussions** - Ask questions and share ideas

***

**Next Steps:** Start with the [Architecture Overview](../developer-guide/architecture/api-architecture/architecture.md) to understand the system design, or jump straight to [Quick Start](guides/quick-start.md) to begin development.
