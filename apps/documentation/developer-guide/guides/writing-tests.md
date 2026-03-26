# Writing Tests

Tests in this project use **Vitest**. There is no `@testing-library` or Jest installed. This guide covers the patterns you will encounter and how to write new tests correctly.

---

## Test runner

```bash
pnpm test                    # all packages, with coverage
cd apps/api && pnpm test     # API only
cd apps/front && pnpm test   # frontend only

# Single file
cd apps/api && pnpm vitest run src/modules/auth/application/use-cases/login.usecase.test.ts
```

Tests run in `node` environment. There is no DOM — do not use `document`, `window`, or browser APIs.

---

## Backend: use-case tests

Use-case tests inject mock repositories and assert on business logic. The pattern is:

1. Call `createMocked*Repository()` from the module's `domain/interfaces/*.repository.mock..ts` factory
2. Instantiate the use case with the mock (and any real services it needs)
3. `await expect(...).rejects.toThrow()` for error paths
4. `expect(result).toBeDefined()` / `expect(result.field).toBe(...)` for happy paths

### Example

```typescript
import { describe, it, expect } from "vitest";
import { JWTService } from "../../../../shared/services/token";
import { PasswordService } from "../../../../shared/services/password";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock.";
import { createMockedRefreshTokenRepository } from "../../domain/interfaces/refresh-token.repository.mock.";
import { LoginUseCase } from "./login.usecase";

describe("LoginUseCase", () => {
  const mockedUserRepository = createMockedUserRepository();
  const tokenService = new JWTService();
  const passwordService = new PasswordService();
  const mockedRefreshTokenRepository = createMockedRefreshTokenRepository();

  const useCase = new LoginUseCase(
    mockedUserRepository,
    passwordService,
    tokenService,
    mockedRefreshTokenRepository,
  );

  it("should throw when user not found", async () => {
    await expect(
      useCase.execute({ email: "nobody@example.com", password: "x" }),
    ).rejects.toThrow();
  });

  it("should return tokens when credentials are correct", async () => {
    const result = await useCase.execute({
      email: "test2@example.com",
      password: "Password123:)",
    });
    expect(result).toBeDefined();
  });
});
```

---

## Mock repository factories

Every module that has infrastructure dependencies ships a `*.repository.mock..ts` file (note the double dot before `ts`) in `domain/interfaces/`. These factories return a plain object implementing the repository interface, with `vi.fn()` stubs and hardcoded fixture users.

### Writing a factory

```typescript
import { vi } from "vitest";
import { Review } from "../entities/review.entity";
import type { IReviewRepository } from "./IReviewRepository";

const fixtureReview = new Review({
  id: "review-uuid-1",
  userId: "user-uuid-1",
  contentId: "content-uuid-1",
  rating: 4,
  text: "Great film",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function createMockedReviewRepository(
  overrides: Partial<IReviewRepository> = {},
): IReviewRepository {
  const defaults: IReviewRepository = {
    findById: (id: string) =>
      Promise.resolve(id === fixtureReview.id ? fixtureReview : null),
    findByUser: () => Promise.resolve([fixtureReview]),
    create: vi.fn().mockResolvedValue(fixtureReview),
    update: vi.fn().mockResolvedValue(fixtureReview),
    delete: vi.fn().mockResolvedValue(undefined),
  };

  return { ...defaults, ...overrides };
}
```

The `overrides` parameter lets individual tests replace specific methods without duplicating the factory:

```typescript
const repo = createMockedReviewRepository({
  findById: () => Promise.resolve(null), // force "not found" path
});
```

---

## Backend: middleware tests

Middleware tests construct partial `req`/`res` objects. Pass a `next` that throws on error so you can assert on it:

```typescript
import { describe, it, expect, vi } from "vitest";
import { authMiddleware } from "./auth.middleware";

describe("authMiddleware", () => {
  it("should call next with UnauthorizedError when no token", async () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
```

---

## Frontend: component tests (no DOM)

The frontend Vitest config uses `node` env — no DOM renderer. Call components as plain functions and inspect the JSX tree:

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock react's useState if the component uses local state
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return { ...actual, useState: vi.fn(() => [null, vi.fn()]) };
});

import { MyComponent } from "./my-component";

function findText(node: any, text: string): boolean {
  if (typeof node === "string") return node.includes(text);
  if (typeof node === "number") return String(node).includes(text);
  if (!node?.props) return false;
  return (
    findText(node.props.children, text) ||
    (Array.isArray(node.props.children) &&
      node.props.children.some((c: any) => findText(c, text)))
  );
}

describe("MyComponent", () => {
  it("renders the title", () => {
    const el = MyComponent({ title: "Hello" });
    expect(findText(el, "Hello")).toBe(true);
  });
});
```

### Mocking hooks with `vi.hoisted`

Variables used inside `vi.mock` factories must be hoisted to avoid TDZ errors:

```typescript
const mockUser = vi.hoisted(() => ({ id: "1", username: "alice" }));

vi.mock("../stores/auth.store", () => ({
  useAuthStore: () => ({ user: mockUser }),
}));
```

---

## Frontend: service / store tests

Test pure functions and Zustand stores without any component rendering:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseApiError } from "@/lib/api/parse-error";

describe("parseApiError", () => {
  it("extracts fieldErrors from a 422 response", () => {
    const err = {
      response: {
        data: { fieldErrors: { email: "Already in use" } },
      },
    };
    const { fieldErrors } = parseApiError(err);
    expect(fieldErrors?.email).toBe("Already in use");
  });
});
```

---

## Vitest config aliases

The `vitest.config.ts` in `apps/front` must alias both `@` (source root) and `@packages/api-sdk` (SDK has no `dist/`):

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@packages/api-sdk": path.resolve(
      __dirname,
      "../../packages/api-sdk/src/index.ts",
    ),
  },
},
```

---

## What to test

| Layer | What to test | Mock |
|---|---|---|
| Domain — entities | Pure business methods | None needed |
| Application — use cases | All execution paths (happy + error) | Repository + service mocks |
| Infrastructure — middleware | Auth header handling, error forwarding | Partial `req`/`res` objects |
| Frontend — pure functions | `parseApiError`, mapper functions, stores | Module-level `vi.mock` |
| Frontend — components | Rendered JSX tree, text content, class names | Hook mocks via `vi.mock` |

### What NOT to test

- **Generated SDK** — do not write tests for files under `packages/api-sdk/src/generated/`
- **Drizzle migrations** — schema correctness is validated at startup
- **Server bootstrap** — `index.ts` and `server.ts` are integration concerns, not unit concerns

---

## Common mistakes

**Using `jest.fn()` instead of `vi.fn()`**
Vitest uses its own mock API. Import `vi` from `vitest`, not `jest` from `@jest/globals`.

**Missing `await` on `rejects.toThrow()`**
```typescript
// Bad — the assertion runs synchronously and always passes
expect(useCase.execute(bad)).rejects.toThrow();

// Good
await expect(useCase.execute(bad)).rejects.toThrow();
```

**Importing the SDK from `dist/`**
`packages/api-sdk` has no built output. Use the source alias (`@packages/api-sdk` → `src/index.ts`) in Vitest config. Do not add `dist/` to the package.

**Calling `React.render` or accessing `document`**
The Vitest environment is `node`. There is no DOM. Call components as functions and walk the returned JSX tree manually.
