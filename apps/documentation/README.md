# Kirona — Documentation

![Stack](https://img.shields.io/badge/stack-React%2019%20%7C%20Express%205%20%7C%20PostgreSQL%20%7C%20Socket.IO-blue)
![Monorepo](https://img.shields.io/badge/monorepo-pnpm%20%2B%20Turborepo-orange)
![Tests](https://img.shields.io/badge/tests-Vitest-green)
![License](https://img.shields.io/badge/license-MIT-green)

Kirona is a social platform centered around cinema and TV series, allowing users to discover content, manage their watchlist, interact with a community of friends, and communicate in real time. Built as a TypeScript monorepo with an Express 5 REST API, a React 19 frontend, and PostgreSQL.

---

## Quick navigation

### For contributors

| Resource | Description |
|---|---|
| [Computer Setup](getting-started/computer-setup.md) | Install VS Code, Node, pnpm, Docker — macOS and Windows (WSL2 + Devenv) |
| [Getting Started](getting-started/README.md) | Set up the project locally (with or without Phase access) |
| [Development Workflow](getting-started/development-workflow.md) | Daily dev cycle, commands, and conventions |
| [Developer Guide](developer-guide/README.md) | Architecture deep-dives and step-by-step guides |
| [CONTRIBUTING.md](../../../CONTRIBUTING.md) | How to contribute, PR process, commit conventions |

### Architecture

| Resource | Description |
|---|---|
| [System Overview](architecture/README.md) | Monorepo structure, packages, Turborepo pipeline |
| [Backend](architecture/backend.md) | Clean Architecture, modules, middleware chain |
| [Frontend](architecture/frontend.md) | File-based routing, feature modules, SDK pipeline |
| [Real-time](architecture/realtime.md) | Socket.IO namespace, events, client singleton |
| [CI/CD](architecture/ci-cd.md) | GitHub Actions workflows, Google Cloud Run deployment |

### Reference

| Resource | Description |
|---|---|
| [REST API](api/README.md) | All endpoints, JWT auth flow, response formats |
| [Data Model](database/README.md) | ERD, table descriptions, indexes, migration strategy |
| [Technical Choices](technical-choices.md) | Why each technology was selected |
| [Project Report](rapport.md) | Functional scope, team roles, architecture summary |

---

## Developer Guide highlights

The [Developer Guide](developer-guide/README.md) covers the internal mechanics that every contributor needs to understand:

- **[Decorator System](developer-guide/architecture/decorator-system.md)** — How `@Controller`, `@Get`, `@Protected`, `@ValidateBody` etc. work and how `DecoratorRouter` builds Express routes and the OpenAPI spec from metadata
- **[TMDB Integration](developer-guide/architecture/tmdb-integration.md)** — The composite repository pattern: how content is fetched on demand from TMDB, stored in PostgreSQL, and served — with full sequence diagrams
- **[Error Handling](developer-guide/architecture/error-handling.md)** — The `AppError` hierarchy and how errors propagate through all layers to a consistent JSON response
- **[Creating a Module](developer-guide/guides/creating-a-module.md)** — End-to-end walkthrough: DB schema → migration → entity → repository → use cases → controller → registration → SDK regeneration
- **[Adding an Endpoint](developer-guide/guides/adding-an-endpoint.md)** — Fastest path to adding one route to an existing module
- **[Commit Conventions](developer-guide/guidelines/commit-conventions.md)** — Message format, types, scopes
- **[Code Style](developer-guide/guidelines/code-style.md)** — Biome rules, naming conventions, patterns
- **[Pull Request Guide](developer-guide/guidelines/pull-request.md)** — Branch strategy, PR size, review process
