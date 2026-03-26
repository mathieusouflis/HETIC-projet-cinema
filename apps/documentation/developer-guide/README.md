# Developer Guide

Welcome to the Kirona developer guide. This section covers everything you need to contribute to the codebase: how the systems are built, the patterns in use, and step-by-step guides for common tasks.

---

## Architecture deep-dives

| Document | What it covers |
|---|---|
| [Decorator System](architecture/decorator-system.md) | How `@Controller`, `@Get`, `@Protected`, `@ValidateBody` etc. work under the hood — and how the `DecoratorRouter` turns them into Express routes + OpenAPI spec |
| [Module Pattern](architecture/module-pattern.md) | How a module is structured (domain / application / infrastructure), how it is wired together, and how it is registered |
| [TMDB Integration](architecture/tmdb-integration.md) | The full TMDB → Composite Repository → Database flow with sequence diagrams |
| [Error Handling](architecture/error-handling.md) | The `AppError` hierarchy, how errors propagate through layers, and how the global error middleware formats responses |

---

## Step-by-step guides

| Guide | What it covers |
|---|---|
| [Creating a Module](guides/creating-a-module.md) | End-to-end walkthrough: schema → migration → repository → use case → controller → registration → SDK |
| [Adding an Endpoint to an Existing Module](guides/adding-an-endpoint.md) | Fastest path to adding one new route |
| [Writing Tests](guides/writing-tests.md) | How to test use cases, middleware, and frontend services |

---

## Team conventions

| Document | What it covers |
|---|---|
| [Commit Conventions](guidelines/commit-conventions.md) | Message format, types, scopes, and examples |
| [Code Style](guidelines/code-style.md) | Biome rules, naming conventions, import order, TypeScript patterns |
| [Pull Request Guide](guidelines/pull-request.md) | Branch strategy, PR size, review process |

---

## FAQ

The [FAQ](faq.md) answers the most common questions about architecture decisions, debugging, and tooling.
