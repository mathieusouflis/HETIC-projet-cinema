# Code Style Guide

The project uses **Biome** (not ESLint or Prettier) for linting and formatting. One tool does both jobs with a single config file at the monorepo root (`biome.json`).

```bash
pnpm lint      # report errors (exits non-zero if any)
pnpm format    # auto-fix formatting and safe lint fixes
```

---

## TypeScript

### Strict mode

All packages run TypeScript in strict mode. The following are **required**:

- Explicit parameter types on every function
- Explicit return types on exported functions and class methods
- `import type` for type-only imports

```typescript
// Good
import type { Request, Response } from "express";

export async function hashToken(token: string): Promise<string> {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Bad — no return type, no import type
import { Request } from "express";
async function hashToken(token) { ... }
```

### `const` everywhere

Biome enforces `useConst`. Use `const` for all variables that are never reassigned. Reserve `let` only for values that will be reassigned in a loop or conditional branch.

### No double-equals

Always use `===` and `!==`. `==` is banned by `noDoubleEquals`.

### Unused variables

Biome flags unused variables as errors. Remove or prefix with `_` when a parameter must exist in a signature but is intentionally unused.

```typescript
// Intentionally unused parameter
function handler(_req: Request, res: Response): void {
  res.status(200).json({ ok: true });
}
```

---

## Naming conventions

| Element | Convention | Example |
|---|---|---|
| Files — React components | `kebab-case.tsx` | `content-card.tsx` |
| Files — services, hooks, stores | `kebab-case.ts` | `auth.store.ts`, `use-auth.ts` |
| Files — backend modules | `kebab-case.ts` | `login.usecase.ts`, `auth.module.ts` |
| Files — Drizzle schemas | `kebab-case.schema.ts` | `reviews.schema.ts` |
| Files — mock repositories | `*.mock.ts` (double dot before ext) | `review.repository.mock.ts` |
| React components | `PascalCase` | `ContentCard`, `WatchlistPage` |
| React hooks | `camelCase` with `use` prefix | `useAuth`, `useMessages` |
| Zustand stores | `camelCase` with `use` prefix | `useAuthStore`, `useTypingStore` |
| Backend classes | `PascalCase` | `LoginUseCase`, `DrizzleReviewRepository` |
| Backend interfaces | `PascalCase` with `I` prefix | `IReviewRepository`, `ITokenService` |
| Variables and functions | `camelCase` | `parseApiError`, `hashToken` |
| Constants (module-level) | `UPPER_SNAKE_CASE` | `REFRESH_TOKEN_COOKIE_NAME` |
| Zod validators | `camelCase` with `Validator` suffix | `createReviewValidator`, `listQueryValidator` |
| DTO types | `PascalCase` with `DTO` or semantic suffix | `CreateReviewDTO`, `ReviewResponse` |
| Enums | `PascalCase` values | `WatchlistStatus.Watching` |

---

## Import order

Biome enforces a consistent import order:

1. Node built-ins (`node:crypto`, `node:path`)
2. External packages (`express`, `zod`, `drizzle-orm`)
3. Internal packages (`@packages/config`, `@packages/logger`)
4. Relative imports (from nearest to furthest)

Separate each group with a blank line. Use `import type` for pure type imports.

```typescript
import { createHash } from "node:crypto";

import type { Request, Response } from "express";
import { z } from "zod";

import { config } from "@packages/config";

import { NotFoundError } from "../../../../shared/errors/index.js";
import type { IReviewRepository } from "../../domain/interfaces/IReviewRepository.js";
```

---

## Strings and formatting

- **Double quotes** in JSX attributes (`jsxQuoteStyle=double`)
- **Single or double quotes** in TypeScript — Biome defaults to double
- **Trailing commas** in ES5 positions (arrays, objects, function params)
- **Semicolons** required everywhere

---

## Backend patterns

### Always use `asyncHandler`

Every controller method must be wrapped:

```typescript
// Good
list = asyncHandler(async (req: Request, res: Response) => { ... });

// Bad — async errors won't reach errorMiddleware
list = async (req: Request, res: Response) => { ... };
```

### No `console` in application code

Use `@packages/logger` instead. `console.log` is permitted but `console.error`, `console.warn`, etc. trigger a Biome warning in non-logger packages.

```typescript
import { logger } from "@packages/logger";

logger.info("User logged in", { userId });
logger.error("Unexpected DB error", error);
```

### Error throwing

Use typed `AppError` subclasses. Never throw raw `new Error(...)` from application or domain code:

```typescript
// Good
throw new NotFoundError(`Review ${id}`);
throw new ConflictError("Email already in use");
throw new UnauthorizedError("Invalid credentials");

// Bad
throw new Error("not found");
```

### Repository methods return entities, not raw DB rows

```typescript
// Good
async findById(id: string): Promise<Review | null> {
  const row = await db.select().from(reviews).where(eq(reviews.id, id));
  return row[0] ? new Review(row[0]) : null;
}

// Bad — leaks DB layer types upward
async findById(id: string) {
  return db.select().from(reviews).where(eq(reviews.id, id));
}
```

---

## Frontend patterns

### API calls always go through services

Never call SDK functions directly from components. Use the service layer:

```typescript
// Good — in a component
const { data } = queryReviewService.list(contentId);

// Bad — direct SDK call in a component
const { data } = useQuery({ queryFn: () => gETReviews({ contentId }) });
```

### Error handling

Always use `parseApiError(err)` from `src/lib/api/parse-error.ts`:

```typescript
} catch (err) {
  const { fieldErrors, globalError } = parseApiError(err);
  // handle field errors for form validation
  // handle globalError for toast/alert
}
```

Never check `error.response.status` manually.

### Forms

Use the `Field / FieldGroup / FieldLabel / FieldError` + `InputGroup` components with `Controller` from `react-hook-form`. See `src/features/settings/change-password.tsx` as the canonical example.

---

## Running the full validation suite locally

Before pushing:

```bash
pnpm lint          # must pass with zero errors
pnpm check-types   # must pass with zero errors
pnpm test          # must pass (all tests green)
pnpm build         # must succeed
```

The pre-commit hook runs the same suite automatically, but running it manually first saves time.
