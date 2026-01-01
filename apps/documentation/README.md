---
icon: hand-wave
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: true
metaLinks: {}
---

# 🎬 Cinema Project Documentation

Welcome to the **Cinema Project** - a modern, community-driven cinema platform built with cutting-edge web technologies. This documentation provides comprehensive guides for developers, API references, and project information.

## 🎬 About the Project

The Cinema Project is a full-stack application that enables users to discover movies, create watch parties, and engage with a vibrant cinema community. Built as a monorepo using Turborepo, it showcases modern development practices and scalable architecture.

### Key Features

* **🎥 Movie Discovery** - Browse and search extensive movie catalogs
* **👥 Community Features** - User profiles, reviews, and social interactions
* **🎉 Watch Parties** - Real-time synchronized viewing experiences
* **🔐 Secure Authentication** - JWT-based authentication system
* **📱 Responsive Design** - Optimized for all devices
* **⚡ Real-time Updates** - WebSocket-powered live features

## 🏗️ Architecture Overview

This project follows a **monorepo architecture** with clear separation of concerns:

```
HETIC-projet-cinema/
├── apps/
│   ├── api/           # Express.js Backend API
│   ├── front/         # Next.js Frontend Application
│   └── documentation/ # GitBook Documentation
├── packages/
│   ├── ui/            # Shared React Components
│   ├── eslint-config/ # Shared ESLint Configuration
│   └── typescript-config/ # Shared TypeScript Configuration
└── docs/              # Additional Documentation
```

## 🚀 Quick Navigation

<table data-card-size="large" data-view="cards"><thead><tr><th></th><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><strong>🔧 Developer Guide</strong></td><td>Development setup, tools, and workflows</td><td>Get started with development environment setup and best practices</td><td><a href="developer/">developer</a></td></tr><tr><td><strong>📡 API Documentation</strong></td><td>Complete API reference and guides</td><td>Comprehensive backend API documentation and integration guides</td><td><a href="api-documentation/">api-documentation</a></td></tr></tbody></table>

## 🛠️ Technology Stack

### Frontend

* **Next.js 14** - React framework with App Router
* **TypeScript** - Type-safe development
* **Tailwind CSS** - Utility-first styling
* **React Query** - Server state management

### Backend

* **Node.js 20+** - JavaScript runtime
* **Express.js** - Web application framework
* **PostgreSQL** - Primary database
* **Drizzle ORM** - Type-safe database operations
* **JWT** - Authentication tokens
* **WebSocket** - Real-time communication

### Development Tools

* **Turborepo** - Monorepo build system
* **ESLint** - Code linting
* **Prettier** - Code formatting
* **Vitest** - Unit testing framework
* **Docker** - Containerization
* **pnpm** - Package management

## 📚 Documentation Sections

### For Developers

* [**Developer Setup**](developer/) - Environment setup and development tools
* [**Tools & Configuration**](developer/tools-and-setup/) - IDE setup, WSL, and development environment

### For API Integration

* [**API Overview**](api-documentation/) - Complete API documentation
* [**Architecture Guide**](developer-guide/architecture/api-architecture/architecture.md) - System design and patterns
* [**Getting Started**](api-documentation/guides/) - Quick start and setup guides
* [**API Reference**](api-documentation/reference/) - Endpoint documentation
* [**Examples**](/broken/pages/SKW7YUUEqmIti47kic96) - Practical implementation examples

## 🚦 Getting Started

### Prerequisites

* **Node.js 20+**
* **pnpm** (recommended package manager)
* **PostgreSQL 14+**
* **Git**

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd HETIC-projet-cinema

# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
# Edit .env files with your configuration

# Start the database (Docker required)
pnpm db:start

# Run database migrations
pnpm db:migrate

# Start all applications in development mode
pnpm dev
```

### Access Points

* **Frontend**: http://localhost:3000
* **API**: http://localhost:3001
* **Documentation**: Available in this GitBook

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Read the Documentation** - Familiarize yourself with the project structure
2. **Follow Coding Standards** - Use ESLint and Prettier configurations
3. **Write Tests** - Ensure your code is properly tested
4. **Update Documentation** - Keep documentation current with changes

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📖 Additional Resources

* [**Project Repository**](https://github.com/your-org/HETIC-projet-cinema) - Source code and issues
* [**API Playground**](http://localhost:3001/docs) - Interactive API documentation
* [**Design System**](packages/ui/) - Shared component library

## 📞 Support & Contact

* **Issues**: Report bugs and request features on GitHub
* **Discussions**: Join community discussions
* **Documentation**: This GitBook for comprehensive guides

***

**Ready to start?** Jump to the [Developer Guide](developer/) to set up your development environment, or explore the [API Documentation](api-documentation/) to understand the backend architecture.
