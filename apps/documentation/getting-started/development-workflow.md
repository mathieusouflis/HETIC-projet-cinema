# Development Workflow

This document describes the conventions and processes to follow on a daily basis when contributing to the project.

---

## Git Workflow

### Branches

No branch naming convention is documented in the repository. The main branch is `main`.

Recommended practices (not enforced by tooling) are:

```
feature/<short-description>   # New feature
fix/<short-description>       # Bug fix
refactor/<short-description>  # Refactoring without behavior change
docs/<short-description>      # Documentation only
```

### Commits

No commit convention (Conventional Commits, etc.) is enforced by tooling. Recent commits in the repository use `feat:`, `fix:`, `refactor:` style informally.

Examples observed in the history:
```
feat(rate-limit): Add rate limiting middleware
fix(usernames-lowercase): Normalize usernames to lowercase
refactor(search-page): Improve dark mode styling
```

### Pre-commit Hooks (Husky + lint-staged)

Husky is configured via `.husky/pre-commit`. On every `git commit`, **lint-staged** automatically triggers the following chain on all modified files:

```
1. pnpm lint           — Biome check (errors only)
2. pnpm check-types --affected  — TypeScript check
3. pnpm test           — all tests with coverage
4. pnpm build          — full monorepo build
```

This pipeline is defined in `lint-staged.config.js` at the root. It runs on **all files** (`'*'` as glob) and returns commands as an array. The commit is blocked if any of these steps fail.

> **Important:** This pipeline can take several minutes. Do not bypass hooks with `--no-verify` except in exceptional documented cases.

---

## Daily Development Workflow

### Standard Cycle

```
1. git pull (fetch latest changes)
2. pnpm db:start (if the DB is not already running)
3. pnpm dev (start API + frontend)
4. [development...]
5. pnpm lint (check before commit)
6. pnpm test (make sure tests pass)
7. git add <files> && git commit -m "..."
   -> the pre-commit hook runs automatically
8. git push
```

### Common Commands During Development

```bash
# Check types continuously (optional, depending on IDE)
pnpm check-types

# Automatically fix formatting
pnpm format

# Run only a specific module's tests
cd apps/api && pnpm vitest run src/modules/auth/application/use-cases/login.usecase.test.ts

# Re-run backend tests only
cd apps/api && pnpm test

# Re-run frontend tests only
cd apps/front && pnpm test

# Regenerate the SDK after API changes
pnpm generate-sdk

# Apply new migrations
cd apps/api && pnpm db:migrate
```

---

## Code Conventions

### Linter and Formatter: Biome

The project uses **Biome** (not ESLint or Prettier) for linting and formatting. Configuration is in `biome.json` at the root.

```bash
pnpm lint      # Check (errors only, max 500 diagnostics)
pnpm format    # Auto-fix
```

Notable active rules:
- `useConst` — enforce `const` over `let` when possible (error)
- `useExportType` / `useImportType` — enforce explicit type imports/exports
- `noConsole` — warning, `console.log` allowed (but not other methods)
- `noDoubleEquals` — ban `==` (use `===`)
- `noUnusedVariables` — unused variables banned
- `useExhaustiveDependencies` — warning on React hook dependencies

JavaScript formatting:
- Double quotes for JSX (`jsxQuoteStyle=double`)
- ES5-style trailing commas (`trailingCommas=es5`)
- Semicolons required

### TypeScript

TypeScript 5.9.3 in strict mode. Always explicitly type function parameters and return values. Use `import type` for type-only imports.

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React component files | kebab-case | `content-card.tsx` |
| Service / hook files | kebab-case | `auth.store.ts`, `use-auth.ts` |
| Backend module files | kebab-case | `auth.module.ts`, `login.usecase.ts` |
| React components | PascalCase | `ContentCard` |
| React hooks | camelCase with `use` prefix | `useAuth`, `useMessages` |
| Zustand stores | camelCase with `use` prefix | `useAuthStore`, `useTypingStore` |
| Variables / functions | camelCase | `parseApiError`, `getWebsocketServices` |
| Interfaces | PascalCase with `I` prefix (backend) | `IUserRepository` |
| DTO types | PascalCase | `LoginRequestDTO` |

### File Structure

Respect layer separation in each module:
- `domain/` — entities, repository interfaces (no external dependency)
- `application/` — use cases, controllers, DTOs (depends on `domain/`)
- `infrastructure/` — concrete implementations (Drizzle, external services)

Never import `infrastructure/` from `domain/`, nor `domain/` from `application/controllers/` directly (go through use cases).

---

## Adding a New Backend Module

Here are the steps to create a complete module following the existing structure.

### 1. Create the directory structure

```bash
mkdir -p apps/api/src/modules/<module-name>/application/controllers
mkdir -p apps/api/src/modules/<module-name>/application/use-cases
mkdir -p apps/api/src/modules/<module-name>/application/dto/requests
mkdir -p apps/api/src/modules/<module-name>/application/dto/response
mkdir -p apps/api/src/modules/<module-name>/application/schema
mkdir -p apps/api/src/modules/<module-name>/domain/entities
mkdir -p apps/api/src/modules/<module-name>/domain/interfaces
mkdir -p apps/api/src/modules/<module-name>/infrastructure/database/schemas
mkdir -p apps/api/src/modules/<module-name>/infrastructure/database/repositories
```

### 2. Define the Drizzle schema

In `apps/api/src/modules/<module-name>/infrastructure/database/schemas/<table>.schema.ts`, define the Drizzle table. Then add it to `apps/api/src/database/schema.ts`.

### 3. Generate and apply the migration

```bash
cd apps/api
pnpm db:generate   # Generates a migration file in src/database/migrations/
pnpm db:migrate    # Applies the migration
```

### 4. Create the repository interface

In `domain/interfaces/I<Name>Repository.ts`, define the contract:

```typescript
export interface IExampleRepository {
  findById(id: string): Promise<ExampleEntity | null>;
  create(data: CreateExampleDTO): Promise<ExampleEntity>;
  // ...
}
```

### 5. Implement the Drizzle repository

In `infrastructure/database/repositories/drizzle-<name>.repository.ts`, implement the interface with Drizzle ORM.

### 6. Create the use cases

In `application/use-cases/<action>.usecase.ts`:
- The use case receives the repository via injection (constructor or parameter)
- Contains the business logic
- Throws errors via classes from `src/shared/errors/`

### 7. Create DTOs with Zod

In `application/dto/requests/` and `application/dto/response/`, define Zod schemas. Request schemas serve both validation (middleware) and OpenAPI generation.

### 8. Create the controller

In `application/controllers/<name>.controller.ts`, use `@Route`, `@Get`, `@Post`, etc. decorators to define endpoints. The controller instantiates the use case with the injected repository.

### 9. Create the module file

In `<module-name>.module.ts`, register the module with its router:

```typescript
export class ExampleModule {
  // Repository, use cases, controller instantiation
  // Express Router creation via DecoratorRouter
}
```

### 10. Register the module

In `apps/api/src/modules/index.ts`, import and register the module via `moduleRegistry.register(...)`.

### 11. Regenerate the SDK

```bash
pnpm generate-sdk
```

The new endpoint is now accessible in the frontend via the SDK.

---

## Adding a New Frontend Route

Routing is managed by **TanStack Router** with the Vite plugin in file-based mode. Route files are in `apps/front/src/app/`.

### 1. Create the route file

TanStack Router's naming convention automatically determines the URL:

| File | Generated URL |
|------|--------------|
| `src/app/_main/example/index.tsx` | `/example` (protected route) |
| `src/app/example/index.tsx` | `/example` (public route) |
| `src/app/_main/example/$id/index.tsx` | `/example/:id` (dynamic route) |

Routes under `_main/` are wrapped in the protected layout (`_main.tsx`) which requires authentication.

### 2. Define the route component

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/example/')({
  component: ExamplePage,
})

function ExamplePage() {
  return <div>Page content</div>
}
```

### 3. Regenerate the route tree

TanStack Router automatically regenerates `src/app/routeTree.gen.ts` via the Vite plugin on startup or when a route file is saved. No manual action required.

### 4. Create the feature module (if needed)

For a non-trivial feature, create a directory in `apps/front/src/features/<feature-name>/` with the structure:

```
features/<feature-name>/
├── components/         # Feature-specific React components
├── hooks/              # Custom React hooks
├── stores/             # Zustand store (if shared state needed)
└── index.tsx           # Feature entry point
```

### 5. Create the API service

In `apps/front/src/lib/api/services/<name>.ts`, follow the dual-export pattern:

```typescript
// Imperative functions (for event handlers, mutations)
export const exampleService = {
  create: async (data: CreateExampleBody) => {
    const response = await pOSTExamples(data);
    return response.data;
  },
}

// React hooks (for components)
export const queryExampleService = {
  list: () => useQuery({
    queryKey: ['examples'],
    queryFn: () => exampleService.list(),
  }),
}
```

### 6. Add navigation (if needed)

Add the link in the navigation component (`_main.tsx` or the nav component in `components/layout/`).

---

## Regenerating the API SDK

### When to regenerate

The SDK (`packages/api-sdk/src/generated/`) must be regenerated every time an API endpoint is modified:
- Adding a new endpoint
- Modifying request parameters or body
- Modifying a response
- Removing an endpoint

### How to regenerate

```bash
# From the monorepo root
pnpm generate-sdk
```

This command:
1. Runs `turbo run generate-sdk` which executes the script in `apps/api`
2. Deletes `packages/api-sdk/src/generated/`
3. Runs Orval on `apps/api/api-documentation.json`
4. Regenerates types and functions in `packages/api-sdk/src/generated/`

### Important rules

- **Never manually modify** files in `packages/api-sdk/src/generated/`. They are overwritten on every generation.
- The `api-sdk` package has no `dist/` directory. Always import from source.
- If the OpenAPI spec (`api-documentation.json`) is not up to date, start the API in dev and retrieve the spec from `http://localhost:3000/api/v1/openapi.json`.

### Generated Function Naming

Functions generated by Orval use the HTTP method prefix in camelCase:

| HTTP Method | Prefix | Example |
|-------------|--------|---------|
| GET | `gET` | `gETContents`, `gETUsersMe` |
| POST | `pOST` | `pOSTAuthLogin`, `pOSTContents` |
| PUT | `pUT` | `pUTUsersMe` |
| PATCH | `pATCH` | `pATCHMessages123` |
| DELETE | `dELETE` | `dELETEUsersMe` |
