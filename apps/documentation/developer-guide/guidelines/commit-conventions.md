# Commit Conventions

Kirona uses a **Conventional Commits**-inspired format. It is not strictly enforced by tooling, but following it keeps the history readable and makes changelogs trivial to generate.

---

## Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

The first line is the **subject**. It must:
- Be **72 characters or fewer**
- Use the **imperative mood** ("add", not "adds" or "added")
- Not end with a period

---

## Types

| Type | When to use | Example |
|---|---|---|
| `feat` | New feature or user-visible behavior | `feat(auth): add refresh token revocation` |
| `fix` | Bug fix | `fix(watchlist): prevent duplicate entries` |
| `refactor` | Restructuring without behavior change | `refactor(movies): extract TMDB mapper to utility` |
| `test` | Adding or updating tests | `test(auth): cover LoginUseCase error paths` |
| `docs` | Documentation only | `docs(api): document pagination query params` |
| `chore` | Tooling, deps, config, scripts | `chore(deps): upgrade drizzle-kit to 0.31` |
| `perf` | Performance improvement | `perf(messages): batch insert conversation participants` |
| `ci` | CI/CD pipelines | `ci: cache Turborepo build in deploy workflow` |
| `style` | Formatting, whitespace — no logic change | `style: run biome format on api module` |

---

## Scopes

Scope is optional but recommended. Use the feature area or package name:

| Scope | Applies to |
|---|---|
| `auth` | Authentication module |
| `users` | Users module |
| `movies` | Movies module |
| `series` | Series module |
| `watchlist` | Watchlist module |
| `friendships` | Friendships module |
| `messages` | Messages module |
| `conversations` | Conversations module |
| `ratings` | Ratings module |
| `sdk` | `packages/api-sdk` generation |
| `config` | `packages/config` |
| `db` | Database schema or migrations |
| `docker` | Docker / Compose files |
| `front` | Frontend (when scope is not a specific feature) |
| `ci` | GitHub Actions workflows |

---

## Body

Use the body when the subject alone does not explain **why**:

```
refactor(auth): replace isProduction flag with COOKIE_SECURE env var

isProduction was hardcoded to check NODE_ENV === "production", which
prevented testing cookie behavior in staging. COOKIE_SECURE is now read
from config.env and can be toggled independently of NODE_ENV.
```

Wrap the body at **80 characters per line**.

---

## Footer

Reference issues and breaking changes in the footer:

```
feat(auth): add server-side refresh token revocation

Closes #42
BREAKING CHANGE: POST /auth/logout now requires the refreshToken cookie.
  Clients that omit it will receive 400 instead of silently succeeding.
```

| Footer key | When to use |
|---|---|
| `Closes #N` | This commit fully resolves the issue |
| `Fixes #N` | Alias for Closes |
| `Refs #N` | Related but doesn't close the issue |
| `BREAKING CHANGE:` | The change is not backwards compatible |

---

## Full examples

```
feat(reviews): add soft-delete endpoint for user reviews

DELETE /reviews/:id sets deleted_at rather than removing the row.
This preserves review metadata for analytics and allows recovery.

Closes #88
```

```
fix(sdk): regenerate after watchlist PUT endpoint was renamed

The previous SDK had pATCHWatchlistContentId; after rename it is
now pUTWatchlistContentId. Frontend calls were silently failing.

Fixes #101
```

```
chore(deps): upgrade Socket.IO to 4.8.3

Resolves a memory leak in the polling transport when clients
disconnect without sending a disconnect event.
```

---

## Pre-commit hook

Every commit automatically runs through:

1. `pnpm lint` — Biome errors
2. `pnpm check-types --affected` — TypeScript errors
3. `pnpm test` — full test suite
4. `pnpm build` — full build

If any step fails, the commit is **aborted**. Fix the issue and re-commit. Do not use `--no-verify` except in genuine emergencies (e.g. a docs-only commit when the DB is not running).
