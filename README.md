# Cinema Project

A community-driven platform for discovering movies and TV series. Users can browse and search content powered by TMDB, manage a personal watchlist, rate films, connect with friends, and chat in real time.

Built as a TypeScript monorepo with an Express API, a React SPA, and a shared auto-generated SDK.

---

## Monorepo Structure

**Apps**

| App | Description |
|-----|-------------|
| `apps/api` | Express 5 REST API + Socket.IO |
| `apps/front` | React 19 + Vite 7 SPA |
| `apps/documentation` | GitBook documentation |

**Packages**

| Package | Description |
|---------|-------------|
| `packages/api-sdk` | Auto-generated Axios client (Orval from OpenAPI spec) |
| `packages/config` | Isomorphic env config shared by API and frontend |
| `packages/logger` | Isomorphic logger |
| `packages/vitest-presets` | Shared Vitest configuration |

---

## Quick Start

> **Prerequisites**: Docker running, access to the Phase project for env vars, Node.js 20+, pnpm.

```bash
pnpm setup-project   # pulls env vars via Phase + install dependencies
pnpm dev # Start db + run migrations + start apps
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| API | http://localhost:3000 |
| API docs (Swagger) | http://localhost:3000/docs |

---

## Features

| Emoji | Meaning |
|-------|---------|
| ✅ | Implemented |
| 🚧 | In progress |
| ❌ | Not started |

### Web App

| Feature | Status |
|---------|--------|
| Auth — email/password | ✅ |
| Auth — OAuth (Google / GitHub) | ❌ |
| User profile & avatar | ✅ |
| Content pages (movie / series) | ✅ |
| Search & filters (genre, year, rating) | ✅ |
| Ratings (1–5) | ✅ |
| Watchlist | ✅ |
| Friendships (send / accept / reject) | ✅ |
| Direct messaging (real-time) | ✅ |
| Reviews & comments | ❌ |
| Forums | ❌ |
| Release calendar | ❌ |
| Watchparty planning | ❌ |
| Email / push notifications | ❌ |

### Browser Extension (Watchparty)

| Feature | Status |
|---------|--------|
| Chrome / Edge extension (Manifest v3) | ❌ |
| Netflix page detection | ❌ |
| Create / join watchparty | ❌ |
| Video sync (play / pause / seek via WebSocket) | ❌ |
| Real-time text chat in extension | ❌ |
| Join by link | ❌ |

### Post-MVP

| Feature | Status |
|---------|--------|
| Voice chat (WebRTC) | ❌ |
| Mobile app / PWA | ❌ |
| Personalized recommendations | ❌ |
| Moderation & reporting | ❌ |
| Premium features (private rooms, themes…) | ❌ |

---

## Documentation

Full technical documentation lives in [`apps/documentation/`](apps/documentation/) and is published on GitBook.

| Topic | Link |
|-------|------|
| Computer & tool setup | [Setup guide](apps/documentation/developer/tools-and-setup/computer-setup/README.md) |
| Windows setup | [Windows](apps/documentation/developer/tools-and-setup/computer-setup/windows-setup.md) |
| WSL + VS Code | [WSL guide](apps/documentation/developer/tools-and-setup/tools-documentation/wsl-for-vscode.md) |
| Database setup | [Database](apps/documentation/developer-guide/tools-and-setup/database-setup.md) |
| Technical specification | [spec.md](apps/documentation/spec.md) |

---

## Guidelines

| Topic | Link |
|-------|------|
| Commit messages | [Commit conventions](apps/documentation/developer-guide/guidelines/commit-message-guidelines.md) |
| Testing | [Testing guidelines](apps/documentation/developer-guide/guidelines/testing-guidelines.md) |
| Bug reports | [Bug reports](apps/documentation/developer-guide/guidelines/bug-reports.md) |
| Creating a new API module | [New module guide](apps/documentation/developer-guide/strategy/api/creating-a-new-module.md) |
