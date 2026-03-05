---
icon: file-code
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

# Technical Specification — Cinema Project

> **Audience**: Developers joining or contributing to the project.
> **Scope**: Full system spec — auth flows, architecture, API structure, real-time layer, and security model.

---

## 1. Project Overview

The Cinema Project is a community-driven platform for discovering movies and TV series. Users can search and browse content (sourced from TMDB), maintain a personal watchlist, rate content, manage friendships, and message each other in real time.

### MVP Feature Set

| Domain | Features |
|--------|----------|
| Auth | Register, login, logout, token refresh |
| Content | Browse, search, filter by genre/type |
| Watchlist | Add/remove content, track watch status and progress |
| Ratings | Rate movies/series (1–5 scale) |
| Community | Send/accept/reject friend requests |
| Messaging | Direct messages between friends (real-time) |

### Out of MVP (schema exists, not implemented)
- Watchparty (scheduled synchronized viewing sessions)
- Notifications
- User activity logs / stats

---

## 2. Tech Stack

### Monorepo
- **Build system**: Turborepo + pnpm workspaces
- **Language**: TypeScript throughout

### Backend (`apps/api`)
- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Database**: PostgreSQL 14+ via Drizzle ORM
- **Real-time**: Socket.IO (namespace: `/messages`)
- **Auth**: JWT (dual-token — see §4)
- **Validation**: Zod + `@asteasolutions/zod-to-openapi`
- **External API**: TMDB (`TMDB_API_KEY`)

### Frontend (`apps/front`)
- **Framework**: React 19 + Vite 7
- **Routing**: TanStack Router (file-based)
- **Server state**: TanStack Query
- **Client state**: Zustand
- **Forms**: react-hook-form + Zod
- **Styling**: Tailwind CSS v4

### Shared Packages
| Package | Purpose |
|---------|---------|
| `packages/api-sdk` | Auto-generated Axios client (Orval from OpenAPI spec) |
| `packages/config` | Isomorphic env config — used by both API and frontend |
| `packages/logger` | Isomorphic logger |
| `packages/vitest-presets` | Shared Vitest configuration |

---

## 3. Architecture

### Backend — Clean Architecture

The API follows **Clean Architecture** principles. Each domain feature is an isolated module under `apps/api/src/modules/`, structured in three layers:

- **Domain** — entities, repository interfaces, domain errors. Has zero dependencies on infrastructure.
- **Application** — use cases and DTOs. Depends only on domain interfaces; one class per business operation.
- **Infrastructure** — Drizzle ORM repositories, Express route definitions, external adapters. Implements domain interfaces.

Dependency injection is done manually at module bootstrap. Use cases never import from infrastructure directly.

**Modules**: `auth` · `users` · `contents` · `movies` · `series` · `seasons` · `episodes` · `peoples` · `categories` · `platforms` · `content-platforms` · `content-credits` · `watchlist` · `messages` · `conversations` · `friendships` · `ratings`

All routes mount under `/api/v1`.

### Frontend — Feature Architecture

The frontend is organized around feature modules. Each feature owns its UI, hooks, stores, and service calls:

```
app/
features/
components/ui/
lib/api/services/
lib/socket/
```

Each domain service has two exports: `query*Service` (React hooks) and `*Service` (plain async functions for use outside React).

### API SDK

`packages/api-sdk` is **auto-generated** by Orval from `apps/api/api-documentation.json`. Never edit generated files manually. Run `pnpm generate-sdk` after any backend route change.

---

## 4. Authentication & Security

### Token Strategy

The system uses a **dual-token JWT scheme**:

| Token | TTL | Transport | Storage |
|-------|-----|-----------|---------|
| Access token | 15 min | `Authorization: Bearer` header | Frontend memory (Zustand + sessionStorage) |
| Refresh token | 7 days | `httpOnly` cookie | Browser cookie only |

### Auth Endpoints

| Method | Path | Auth required |
|--------|------|---------------|
| `POST` | `/api/v1/auth/register` | No |
| `POST` | `/api/v1/auth/login` | No |
| `POST` | `/api/v1/auth/refresh` | No (cookie) |
| `POST` | `/api/v1/auth/logout` | Yes (Bearer) |
| `GET` | `/api/v1/auth/me` | Yes (Bearer) |

### Login / Register Flow

```
POST /api/v1/auth/login  (or /register)
  → verify credentials / create user
  → generateTokenPair(userId, email)
  → return { accessToken, user } in response body
  → Set-Cookie: refreshToken=<jwt>; HttpOnly; SameSite=Strict; Secure (prod only)
```

The refresh token is a signed JWT stored **only in the browser cookie**. It is not persisted in the database.

### Refresh Flow

```
POST /api/v1/auth/refresh
  → read refreshToken from httpOnly cookie
  → verifyRefreshToken(jwt)  — checks signature and expiry only, no DB lookup
  → confirm user still exists in DB
  → generateTokenPair(userId, email)   ← brand-new token pair
  → return new { accessToken, user } + overwrite refreshToken cookie
```

**Token rotation**: every successful refresh issues a new pair. The old token is implicitly discarded by overwriting the cookie.

### Logout Flow & Current Revocation Gap

```
POST /api/v1/auth/logout  (requires valid Bearer access token)
  → responds 200 OK
  → does NOT clear the cookie server-side
  → does NOT invalidate the JWT
```

Logout is currently **client-side only**. The server confirms authentication then it is the client's responsibility to drop the access token from memory and clear the cookie locally.

**Security implication**: a stolen refresh token remains exploitable for up to 7 days after logout.

The `refresh_tokens` table (`token_hash`, `revoked_at`, `ip_address`, `user_agent`, `device_fingerprint`) was designed to close this gap. Implementing server-side revocation would require:
1. On login/register: hash the refresh JWT, insert a row into `refresh_tokens`
2. On refresh: look up the hash, reject if `revoked_at IS NOT NULL`
3. On logout: set `revoked_at = NOW()` for the user's active tokens

This is tracked as a `// TODO` in `auth.controller.ts`.

### Authorization

- No RBAC — all authenticated users have the same permissions
- Routes protected by `authMiddleware`, which validates the Bearer access token
- Resources are scoped by the JWT `userId` claim (users can only modify their own data)

---

## 5. Real-Time Layer (Socket.IO)

**Namespace**: `/messages` · **Transport**: WebSocket only · **Auth**: JWT in handshake `auth` header

### Events

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `conversation:join` | `{ conversationId }` |
| Client → Server | `message:send` | `{ conversationId, content }` |
| Client → Server | `message:typing` | `{ conversationId }` |
| Server → Client | `conversation:joined` | `{ conversationId }` |
| Server → Client | `message:new` | `MessageDTO` |
| Server → Client | `message:typing` | `{ conversationId, userId }` |

Typing state is stored in Zustand (`useTypingStore`, keyed by `conversationId`).

---

## 6. Content Data Source (TMDB)

Content is sourced from the **TMDB API**. Records are stored locally in the `content` table after being fetched — `tmdb_id` (unique) acts as the external key. The `tmdb_fetch_status` table tracks import state per record.

---

## 7. API Conventions

**Base URL**: `/api/v1`

**Response envelope**:
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Error shape** (extracted via `parseApiError()` on the frontend):
```json
{ "fieldErrors": { "email": "Already in use" }, "globalError": "..." }
```

---

## 8. Environment Configuration

Environment variables are injected via **[Phase](https://phase.dev)** and parsed by `packages/config`, which exports a single `config.env` object used by both the API and frontend.

### Key variables

| Variable | Used by | Notes |
|----------|---------|-------|
| `TMDB_API_KEY` | API | TMDB content sourcing |
| `JWT_SECRET` | API | Signs access + refresh tokens |
| `SESSION_SECRET` | API | Express session |
| `COOKIE_SECURE` | API | `true` in production |
| `CORS_ORIGIN` | API | Frontend origin for CORS |
| `DATABASE_*` | API | Postgres connection |
| `BACKEND_PORT` | API | Default `3000` |
| `VITE_API_URL` | Frontend | Points to API base URL |

### Port defaults

| Service | Port |
|---------|------|
| Frontend | 3001 |
| API | 3000 |
| PostgreSQL | 5432 |

---

## 9. Development Quickstart

> **Prerequisite**: Docker must be running before the next steps.

```bash
# 1. Install dependencies
pnpm install

# 2. Pull env vars from Phase and start the database
pnpm setup-project

# 3. Start all services
pnpm dev
```

### Running tests

```bash
pnpm test                    # all, with coverage
cd apps/api && pnpm test     # API only
cd apps/front && pnpm test   # frontend only

# Single file
cd apps/api && pnpm vitest run src/modules/auth/application/use-cases/login.usecase.test.ts
```

### Linting

```bash
pnpm lint      # check
pnpm format    # auto-fix (Biome)
```

> Use **pnpm only** — npm and yarn are not supported.
