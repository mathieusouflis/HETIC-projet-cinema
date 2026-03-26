# Contributing to Kirona

Thank you for your interest in contributing! This document explains how to get involved, what we expect, and how to get your changes merged.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Code Changes](#submitting-code-changes)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Project Architecture](#project-architecture)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards. Please report unacceptable behavior to the maintainers.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/HETIC-projet-cinema.git
   cd HETIC-projet-cinema
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/original-owner/HETIC-projet-cinema.git
   ```
4. Follow the [development setup guide](apps/documentation/getting-started/README.md) (Path B — without Phase access)

---

## Development Setup

See [Getting Started — Path B](apps/documentation/getting-started/README.md#path-b--without-phase-access-external-contributors) for the full setup guide.

Quick summary:
```bash
cp .env.example .env
# Fill in DB_PASSWORD, JWT_SECRET, TMDB_API_KEY
pnpm install
pnpm dev:local
```

---

## How to Contribute

### Reporting Bugs

Before opening an issue:
- Search [existing issues](../../issues) to avoid duplicates
- Make sure you are on the latest version (`git pull upstream main`)

When opening a bug report, use the **Bug Report** template and include:
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, pnpm version)
- Relevant logs or screenshots

### Suggesting Features

Open a **Feature Request** issue with:
- A clear description of the problem the feature solves
- Your proposed solution
- Alternatives you considered

Features that align with the project's scope and architecture are more likely to be accepted.

### Submitting Code Changes

1. Create a branch from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feat/your-feature-name
   ```
2. Make your changes following the [code style](#code-style) guidelines
3. Write or update tests
4. Run the full validation suite:
   ```bash
   pnpm lint
   pnpm check-types
   pnpm test
   pnpm build
   ```
5. Commit following [commit conventions](#commit-conventions)
6. Push and open a Pull Request

---

## Commit Conventions

We follow a loose **Conventional Commits** style. Each commit message should be:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature or behavior |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Tooling, dependencies, config |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

**Scope** (optional): the module or area affected, e.g. `auth`, `watchlist`, `sdk`, `docker`.

**Examples:**
```
feat(auth): add refresh token revocation on logout
fix(watchlist): return 409 when content already in watchlist
refactor(movies): extract TMDB mapping to separate utility
test(auth): add unit tests for RefreshTokenUseCase
docs(getting-started): add Phase-less dev path
chore(deps): upgrade drizzle-kit to 0.31.0
```

**Rules:**
- Use the **imperative mood** in the description ("add" not "adds" or "added")
- Keep the first line under **72 characters**
- Reference issues in the footer: `Closes #42`, `Fixes #17`

---

## Pull Request Process

1. **One PR per concern** — don't mix unrelated changes
2. **Fill the PR template** — describe what changed and why
3. **Keep diffs small** — large PRs are hard to review; split if needed
4. **All CI checks must pass** before merging (build, type-check, lint, tests)
5. **Address review comments** — don't push force-merges; iterate on feedback
6. **Squash or rebase** before merge if history is messy

PRs are merged by maintainers once they have one approving review and all checks are green.

---

## Code Style

The project uses **Biome** for linting and formatting (not ESLint/Prettier).

```bash
pnpm lint      # Check for errors
pnpm format    # Auto-fix
```

Key rules enforced:
- `const` over `let` everywhere possible
- Explicit `import type` for type-only imports
- No `console` outside the logger package
- Strict equality (`===`, never `==`)
- No unused variables

TypeScript is in **strict mode**. Always type function parameters and return values explicitly.

See [Code Style Guide](apps/documentation/developer-guide/guidelines/code-style.md) for detailed conventions.

---

## Testing

The project uses **Vitest**. Tests live next to the code they test.

```bash
pnpm test                          # All tests with coverage
cd apps/api && pnpm test           # Backend only
cd apps/front && pnpm test         # Frontend only

# Run a single file
cd apps/api && pnpm vitest run src/modules/auth/application/use-cases/login.usecase.test.ts
```

**Backend test conventions:**
- Use mock repositories from `domain/interfaces/*.mock.ts` files
- Test use cases in isolation — no real DB or network calls
- Use `expect(...).rejects.toThrow(SomeError)` for error paths

**Frontend test conventions:**
- No `@testing-library` — call components as plain functions
- Mock React hooks via `vi.mock("react", ...)`
- Use `vi.hoisted()` for variables in mock factories

Every PR should maintain or improve the existing test coverage.

---

## Project Architecture

Before contributing, read the architecture documentation:

- [Monorepo overview](apps/documentation/architecture/README.md)
- [Backend — Clean Architecture](apps/documentation/architecture/backend.md)
- [Frontend architecture](apps/documentation/architecture/frontend.md)
- [Developer Guide](apps/documentation/developer-guide/README.md)
  - [How the decorator system works](apps/documentation/developer-guide/architecture/decorator-system.md)
  - [How to create a module](apps/documentation/developer-guide/guides/creating-a-module.md)
  - [TMDB integration flow](apps/documentation/developer-guide/architecture/tmdb-integration.md)

The most important rule: **never import across layers in the wrong direction**.
- `domain/` has no external imports
- `application/` imports from `domain/` only
- `infrastructure/` imports from `domain/` and external libraries
- Controllers call use cases; use cases call repository interfaces

---

## Questions?

Open a [Discussion](../../discussions) or check the [FAQ](apps/documentation/developer-guide/faq.md).
