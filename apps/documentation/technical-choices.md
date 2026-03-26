# Technical Choices

This document lists the tools and technologies selected for this project, along with the reasons behind their selection.

---

## 1. Development Environment

### pnpm workspaces
**Role in the project**: Package manager and monorepo system. All workspaces (`apps/*` and `packages/*`) are declared in `pnpm-workspace.yaml` and share a single `node_modules` at the root.
**Reason for choice**: pnpm offers faster installation than npm or yarn thanks to its global package store with symlinks. Native workspace management simplifies code sharing between internal packages (`@packages/config`, `@packages/logger`, `@packages/api-sdk`).
**Rejected alternative**: npm workspaces (less performant), yarn (heavier to configure for workspaces).

### Turborepo
**Role in the project**: Task orchestrator for the monorepo. The pipeline defined in `turbo.json` manages task execution order (`build`, `dev`, `test`, `lint`, `check-types`, `generate-sdk`, `db:migrate`) while respecting inter-workspace dependencies.
**Reason for choice**: Turbo caches task results and only executes what has changed, significantly reducing build and CI times. The declarative configuration of task dependencies (`"dependsOn": ["^build"]`) ensures correct order without complex shell scripts.
**Rejected alternative**: Nx (more complex to configure), manual shell scripts (no cache, fragile ordering).

### Docker
**Role in the project**: Containerization of the database in development (`docker-compose.dev.yaml` with PostgreSQL) and the full stack in production (`docker-compose.prod.yaml` with the API, frontend, and an Nginx reverse proxy).
**Reason for choice**: Guarantees an identical database environment across all development machines. In production, multi-stage images (`builder` + `runner`) reduce the final container size and enable reproducible deployments.

### Devenv (Nix) + Direnv
**Role in the project**: System development environment management via Nix (`devenv.nix`, `.devenv.flake.nix`). Direnv (`.envrc`) automatically activates the Nix environment when entering the project directory.
**Reason for choice**: Ensures all developers have exactly the same system tool versions (Node.js, pnpm, etc.) without depending on local installations. Full environment reproducibility.

### Phase (secrets management)
**Role in the project**: Centralized secrets manager. The `phase` CLI is used in npm scripts (`phase run`, `phase secrets export`) to inject environment variables in development and export secrets in production during CI/CD deployment.
**Reason for choice**: Avoids storing secrets in the git repository or sharing them manually between developers. The production deployment retrieves secrets directly from Phase via the service token (`PHASE_SERVICE_TOKEN`), without exposing them in CI logs.

---

## 2. Quality & CI/CD

### Biome
**Role in the project**: Single linting and formatting tool replacing ESLint and Prettier. The configuration in `biome.json` covers accessibility, complexity, style, and security rules across the entire monorepo.
**Reason for choice**: Biome is written in Rust, making it significantly faster than ESLint + Prettier. One tool to configure and maintain instead of two, with consistent rules across the codebase.
**Rejected alternative**: ESLint + Prettier (slower, heavier configuration, risk of conflicts between the two tools).

### Husky + lint-staged
**Role in the project**: Git pre-commit hooks that automatically run lint, type checking, tests, and build before each commit (via `lint-staged.config.js`).
**Reason for choice**: Prevents introducing non-compliant code into the repository. Validation happens locally before even reaching CI, which speeds up feedback.

### GitHub Actions
**Role in the project**: CI/CD with two workflows:
- `pull-request.yaml`: runs on each pull request and launches build, type-check, lint, and tests in parallel.
- `deploy.yaml`: runs on each push to `main`, performs the same checks then deploys the API and frontend to Google Cloud Run.
**Reason for choice**: Native integration with GitHub, declarative YAML configuration, large ecosystem of reusable actions (notably `google-github-actions/auth` for GCP).

---

## 3. Database

### PostgreSQL
**Role in the project**: Main relational database. The schema includes more than 20 tables (users, content, messages, watchlists, friendships, etc.) with JSONB types for flexible metadata and enumerations for statuses.
**Reason for choice**: PostgreSQL offers the robustness of a relational database (constraints, ACID transactions, composite indexes) while supporting JSONB for semi-structured fields (genres, content metadata). Well suited to the complexity of the project's data model.

### Drizzle ORM
**Role in the project**: TypeScript ORM for all interactions with PostgreSQL. The schema is defined in `src/database/schema.ts` (3000+ lines), migrations are managed via `drizzle-kit` (14 migrations from February to March 2026).
**Reason for choice**: Drizzle is fully typed in TypeScript with an API close to SQL, avoiding opaque abstractions. Migrations are automatically generated from the schema diff (`drizzle-kit generate`). Lightweight with no runtime overhead compared to heavier ORMs.
**Rejected alternative**: Prisma (additional code generation, less flexible client for complex queries), TypeORM (weaker TypeScript support, experimental decorators).

---

## 4. Backend

### Express 5
**Role in the project**: HTTP framework for the REST API. All routes are mounted under `/api/v1`. Express also manages the HTTP server shared with Socket.IO.
**Reason for choice**: Express 5 brings native error handling in async middlewares (no more `try/catch` or manual wrappers). Mature ecosystem, maximum flexibility for structuring modules according to Clean Architecture.
**Rejected alternative**: Fastify (less adopted by the team), NestJS (too opinionated for the desired Clean Architecture pattern).

### Zod
**Role in the project**: Runtime schema validation and OpenAPI specification generation. Request and response DTOs are defined with Zod, validated by the `validation.middleware.ts` middleware, and converted to OpenAPI schemas via `@asteasolutions/zod-to-openapi`.
**Reason for choice**: Zod allows defining TypeScript types and runtime validation from a single source of truth. The integration with `zod-to-openapi` automatically generates API documentation without code duplication.

### JWT (dual-token authentication)
**Role in the project**: Authentication system with two tokens: an access token (15 min, transmitted in the `Authorization` header) and a refresh token (7 days, stored in an httpOnly cookie). The `jwt-service.ts` service encapsulates the `jsonwebtoken` library.
**Reason for choice**: The dual-token approach limits the attack surface (short-lived access token) while providing a smooth user experience (transparent refresh). The httpOnly cookie for the refresh token protects against XSS attacks.

### OpenAPI / Swagger
**Role in the project**: Interactive API documentation automatically generated from Zod schemas. Accessible via `/api/v1/docs` (Swagger UI) and `/api/v1/openapi.json` (raw spec). The spec is also used by Orval to generate the frontend SDK.
**Reason for choice**: Single source of truth for documentation and client code generation. Any backend modification automatically propagates to the frontend SDK via `pnpm generate-sdk`.

### Socket.IO
**Role in the project**: Real-time layer for messaging features. The Socket.IO server shares the same port as the Express API. A single `/messages` namespace is active, handling `message:new`, `message:typing`, `conversation:join`, and `conversation:joined` events.
**Reason for choice**: Socket.IO provides an abstraction over WebSocket with polling fallback (important for restrictive network environments), automatic reconnection management, and a simple event-based API. Compatible with Cloud Run proxies via polling transport.
**Rejected alternative**: Native WebSocket (no fallback, manual reconnection handling), SSE (unidirectional, unsuitable for chat).

---

## 5. Frontend

### React 19
**Role in the project**: Main UI library. All components, pages, and features are built with React.
**Reason for choice**: React 19 introduces performance improvements (React compiler) and new APIs (actions, transitions). The most mature ecosystem for SPAs with TanStack Router and Query.

### Vite 7
**Role in the project**: Bundler and development server for the frontend. The `@tanstack/router-vite-plugin` plugin automatically generates `routeTree.gen.ts` from route files.
**Reason for choice**: Vite offers near-instant startup thanks to native ESM in development and fast compilation with esbuild/rollup in production. Much better developer experience than webpack.
**Rejected alternative**: webpack (slow), Create React App (abandoned).

### TanStack Router
**Role in the project**: File-based router for React. Routes are defined in `src/app/` and the Vite plugin automatically generates the route tree. The structure distinguishes public routes (login, register) from protected routes under the `_main.tsx` layout.
**Reason for choice**: TanStack Router is fully TypeScript-typed (route parameters, search params), eliminating an entire category of runtime errors. File-based routing reduces manual configuration.
**Rejected alternative**: React Router v6 (less type-safety, no native file-based routing).

### TanStack Query
**Role in the project**: Client-side data fetching management. All API calls are encapsulated in `useQuery` and `useMutation` hooks. The `QueryClient` is configured at the application root.
**Reason for choice**: TanStack Query automatically handles cache, revalidation, loading and error states, and targeted invalidation after mutations. Avoids reimplementing this logic in every component.
**Rejected alternative**: SWR (fewer features for mutations), Redux Toolkit Query (more verbose).

### Zustand
**Role in the project**: Global state management for three stores: `useAuth` (persisted in `sessionStorage`), `useThemeStore` (persisted in `localStorage`), and `useTypingStore` (ephemeral, real-time typing indicators).
**Reason for choice**: Zustand is minimalist, requires no React `Provider`, and supports persistence via middleware. Well suited to the project's lightweight stores that don't justify Redux's complexity.
**Rejected alternative**: Redux (too verbose for simple stores), Context API (no native persistence, excessive re-renders).

### shadcn/ui (Radix UI)
**Role in the project**: Headless UI component base. Components are installed directly in `src/components/ui/` (23 components: Button, Card, Dialog, Select, etc.) and styled with TailwindCSS. Radix UI provides accessibility and behavior; TailwindCSS provides styling.
**Reason for choice**: shadcn/ui provides accessible, fully customizable components without an external dependency to maintain (code is copied into the project). Styling remains fully under the team's control.
**Rejected alternative**: Material UI (visually opinionated, hard to theme), Chakra UI (heavier bundle).

### Axios
**Role in the project**: HTTP client for all calls to the backend API. A centralized Axios instance in `src/lib/api/client.ts` configures headers, base URL, and the token refresh interceptor.
**Reason for choice**: Axios offers easily composable request/response interceptors, essential for automatic token refresh handling. Compatibility with Orval (SDK generator) requires its use.

### Orval
**Role in the project**: TypeScript SDK generator from the backend's OpenAPI specification. The `@packages/api-sdk` package is fully generated by Orval via `pnpm generate-sdk`. Exported functions follow the `{METHOD}{Path}` naming convention (e.g. `gETContents`, `pOSTAuthLogin`).
**Reason for choice**: Orval automatically synchronizes the API contract between backend and frontend. Any backend API modification propagates to the typed SDK after regeneration, eliminating manual desynchronization.

---

## 6. Tests

### Vitest
**Role in the project**: Testing framework for the backend (middlewares, use-cases, decorators, utilities) and the frontend (services, error parsing). The shared configuration is in `packages/vitest-presets`.
**Reason for choice**: Vitest is natively compatible with Vite and the ESM ecosystem. Tests run in the same context as production code (same module aliases, same TypeScript configuration). Much faster than Jest on modern TypeScript projects thanks to esbuild.
**Rejected alternative**: Jest (requires additional Babel or SWC configuration for TypeScript/ESM, slower, not natively compatible with Vite).

---

## 7. External Data

### TMDB (The Movie Database)
**Role in the project**: External API for retrieving movie and series metadata (titles, posters, synopses, credits, etc.). The key is configured via `TMDB_API_KEY`, accessible via `config.env.externalApi.tmdbApiKey`.
**Reason for choice**: TMDB is the reference API for cinematographic metadata, with an exhaustive database and a well-documented REST API.
**Rejected alternative**: OMDB — present in the initial configuration (`OMDB_API_KEY`) but never implemented on the service side; removed during the environment variable cleanup.
