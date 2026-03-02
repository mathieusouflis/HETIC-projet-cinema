# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Setup & Dev
```bash
pnpm install                          # Install all dependencies
pnpm db:start                         # Start PostgreSQL + run migrations
pnpm dev                              # Start all apps in dev mode
```

### Build & Type-check
```bash
pnpm build                            # Build all packages + apps (includes SDK generation)
pnpm check-types                      # Type-check all packages
pnpm generate-sdk                     # Regenerate API SDK from OpenAPI spec
```

### Test
```bash
pnpm test                             # Run all tests with coverage
cd apps/api && pnpm test              # Run API tests only
cd apps/front && pnpm test            # Run frontend tests only
# Run a single test file:
cd apps/api && pnpm vitest run src/modules/auth/application/auth.service.test.ts
```

### Lint & Format
```bash
pnpm lint                             # Biome check (errors only)
pnpm format                           # Biome check --write (auto-fix)
```

### Database
```bash
pnpm db:start                         # Start Docker Postgres + migrate
pnpm db:stop                          # Stop Postgres container
cd apps/api && pnpm db:migrate        # Run pending migrations
cd apps/api && pnpm db:generate       # Generate new migration from schema diff
cd apps/api && pnpm db:studio         # Open Drizzle Studio GUI
```

## Architecture

### Monorepo Structure
```
apps/api/          - Express 5 REST API + Socket.IO
apps/front/        - React 19 + Vite 7 SPA
packages/api-sdk/  - Generated Axios client (Orval from OpenAPI spec)
packages/config/   - Shared env config
packages/logger/   - Isomorphic logger
packages/vitest-presets/  - Shared Vitest config
```

### Backend (apps/api)

Modules live in `src/modules/` following a DDD structure:
```
module-name/
├── application/       # Services, use cases
├── domain/            # Types, interfaces, domain logic
└── infrastructure/    # Express routes, Drizzle repositories
```

Modules: `auth`, `users`, `movies`, `series`, `seasons`, `episodes`, `peoples`, `categories`, `contents`, `platforms`, `content-platforms`, `content-credits`, `watchlist`, `watchparty`.

- API routes mount under `/api/v1`
- Auth uses JWT dual-token: 15min access token + 7-day refresh token in httpOnly cookie
- Schema validation with Zod; OpenAPI docs auto-generated via `@asteasolutions/zod-to-openapi`
- DB schema defined in `src/database/schema.ts`, migrations in `src/database/migrations.ts`

### Frontend (apps/front)

File-based routing via TanStack Router; route files live in `src/app/`:
```
src/app/
├── __root.tsx                    # Root layout (QueryClientProvider)
├── login/index.tsx
├── register/index.tsx
└── _main.tsx                     # Protected layout (auth guard)
    ├── index.tsx                 # Home / explore
    ├── search/index.tsx
    ├── settings/index.tsx
    └── contents/$contentId/index.tsx
```

Feature modules in `src/features/` (auth, content, explore, search, search-modal, settings).

UI components follow shadcn conventions in `src/components/ui/`.

### API SDK

The SDK in `packages/api-sdk/src/generated/` is **auto-generated** by Orval from `apps/api/api-documentation.json`. Never edit generated files manually — run `pnpm generate-sdk` instead. The SDK exports typed Axios hooks compatible with TanStack Query.

**Important**: `packages/api-sdk` has no `dist/` folder — always import from source. Vitest must alias `@packages/api-sdk` to the source entry:
```ts
"@packages/api-sdk": path.resolve(__dirname, "../../packages/api-sdk/src/index.ts")
```

## Key Patterns

### Forms
Use `Field / FieldGroup / FieldLabel / FieldError` + `InputGroup` components with `Controller` from react-hook-form. See `src/features/settings/change-password.tsx` as the canonical example.

### API Error Handling
Always use `parseApiError(err)` (from `src/lib/api/parse-error.ts`) to extract `{ fieldErrors, globalError }` — never manually check `error.response.status`.

### Testing (no @testing-library)
Frontend tests use Vitest with mocked React hooks. Mock `react`'s `useState` directly via `vi.mock("react", ...)`. Use `vi.hoisted()` for variables referenced inside mock factories to avoid TDZ errors.

## Tooling Notes

- **Linter/Formatter**: Biome (not ESLint/Prettier). Run `pnpm lint` / `pnpm format`.
- **Package manager**: pnpm only — do not use npm or yarn.
- **Port defaults**: Frontend → 3001, API → 5001 (or `BACKEND_PORT`), Postgres → 5432.
- **Env**: Copy `.env.example` to `.env` at the root; `packages/config` centralizes env parsing.
