# Getting Started

This guide covers the complete project setup from a fresh clone to launching in development.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|-----------------|-------|
| Node.js | >= 18 | Checked via the `engines` field in `package.json` |
| pnpm | 10.28.2 | Exact version specified in `packageManager` |
| Docker | any recent version | Required for PostgreSQL via Docker Compose |
| Git | any recent version | |

To check your installed versions:

```bash
node --version
pnpm --version
docker --version
```

To install pnpm at the correct version:

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
```

---

## Secrets and Environment Variables Management

The project uses **Phase** as a centralized secrets manager. The `pnpm dev` script calls `phase run` to inject environment variables into the process without exposing them in the git repository.

Two setup paths exist depending on whether you have access to the team's Phase project:

---

## Path A — With Phase access (team members)

### 1. Install system prerequisites via Devenv

The project provides a reproducible Nix environment via `devenv.nix`. With [Devenv](https://devenv.sh) and [Direnv](https://direnv.net) installed, entering the directory automatically activates the environment:

```bash
# One-time installation
nix-env -iA nixpkgs.devenv
nix-env -iA nixpkgs.direnv
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc  # or zshrc

# Then in the project directory
cd HETIC-projet-cinema
direnv allow   # activates the Nix environment defined in .envrc / devenv.nix
```

This automatically installs: Node.js 24, pnpm, PostgreSQL, Docker, and `phase-cli` at the exact versions declared in `devenv.nix`. **No manual tool installation required.**

> If you prefer not to use Devenv, make sure to install the prerequisites from the table above manually.

### 2. Initialize the project with Phase

```bash
pnpm setup-project
```

This command runs in sequence:
1. `pnpm install` — installs dependencies
2. `phase auth` — Phase authentication (opens browser)
3. `phase init` — links the local project to the team's Phase project
4. `husky` — installs git hooks

### 3. Launch the development environment

```bash
pnpm dev
```

Phase automatically injects all project environment variables. No local `.env` file is needed.

---

## Path B — Without Phase access (external contributors)

### 1. Check prerequisites

Manually install the required tools:

| Tool | Minimum version | Notes |
|------|-----------------|-------|
| Node.js | >= 18 | Recommended: Node 24 (version used internally) |
| pnpm | 10.28.2 | Exact version required |
| Docker | any recent version | Required for PostgreSQL |

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
```

### 2. Clone the repository and install dependencies

```bash
git clone <repo-url>
cd HETIC-projet-cinema
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in **at minimum** the following values (others have working defaults):

| Variable | Description | Example value |
|----------|-------------|---------------|
| `DB_PASSWORD` | PostgreSQL password | `mypassword` |
| `JWT_SECRET` | JWT signing secret | random string >= 32 characters |
| `TMDB_API_KEY` | The Movie Database API key | obtain at themoviedb.org |

> `MAILGUN_API_KEY` can remain empty: emails (verification, reset) will be logged to the console instead of being sent.

To generate random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Launch the development environment

```bash
pnpm dev:local
```

This command:
1. Starts PostgreSQL via Docker Compose (reads `.env` automatically)
2. Injects variables from `.env` into the process via `dotenv-cli`
3. Launches the API and frontend in parallel via Turborepo

The applications start on:
- Frontend: http://localhost:3001
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/v1/docs

---

## Environment Variables

All variables are to be defined in a `.env` file at the project root (copied from `.env.example`).

### Application

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Execution mode (`development` / `production`) |

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `3000` | Express API listening port |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_PORT` | `3001` | Vite server port (dev only) |
| `FRONTEND_URL` | `http://localhost:3001` | Full frontend URL — used for CORS and links in emails |
| `VITE_BACKEND_API_URL` | `http://localhost:3000` | API URL as seen by the browser — injected into the frontend build via Vite |

### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_DATABASE` | `myapp` | Database name |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | — | PostgreSQL password (**required**) |
| `DB_SSL` | `false` | Enable SSL (`true` in production with a remote DB) |

### Security

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | JWT token signing secret (**required**, >= 32 characters) |
| `COOKIE_SECURE` | `false` | HTTPS-only cookies — set to `true` in production |
| `COOKIE_DOMAIN` | `localhost` | Auth cookie domain — in production: root domain (e.g. `example.com`) |

### External API

| Variable | Default | Description |
|----------|---------|-------------|
| `TMDB_API_KEY` | — | The Movie Database API key (**required** for movie/series search) — obtain at [themoviedb.org](https://www.themoviedb.org/) |

### Email (Mailgun)

| Variable | Default | Description |
|----------|---------|-------------|
| `MAILGUN_API_KEY` | _(empty)_ | Mailgun API key — leave empty in development (emails are logged to console) |
| `MAILGUN_API_URL` | — | Mailgun domain (e.g. `mg.yourdomain.com`) |
| `MAILGUN_BASE_URL` | — | Mailgun base URL (e.g. `https://api.eu.mailgun.net`) |

---

## Essential Commands

| Command | What it does | When to use |
|---------|-------------|-------------|
| `pnpm install` | Installs all monorepo dependencies | After a clone, or after modifying a `package.json` |
| `pnpm db:start` | Starts the Docker PostgreSQL container and waits for it to be ready | Before launching dev if the DB is not already started |
| `pnpm db:stop` | Stops the PostgreSQL container | End of work session |
| `pnpm dev` | Launches API + Frontend (requires Phase) | Team members with Phase access |
| `pnpm dev:local` | Launches API + Frontend reading from `.env` (without Phase) | External contributors |
| `pnpm build` | Full build (SDK generation + build of all packages) | Before production or to verify everything compiles |
| `pnpm check-types` | TypeScript type checking across the entire monorepo | Before pushing code |
| `pnpm lint` | Code check with Biome (errors only) | Before a commit, in CI |
| `pnpm format` | Automatically fixes style issues with Biome | During development |
| `pnpm test` | Runs all tests with code coverage | Before a commit, in CI |
| `pnpm generate-sdk` | Regenerates the TypeScript API SDK from the OpenAPI spec | After modifying an API endpoint |
| `pnpm clean` | Removes all build artifacts (.turbo, dist, etc.) | In case of Turbo cache issues |
| `pnpm db:logs` | Displays PostgreSQL container logs in real time | Diagnosing database issues |
| `pnpm db:shell` | Opens a psql shell in the container | Direct database inspection |
| `cd apps/api && pnpm db:migrate` | Applies pending migrations | After adding a new migration |
| `cd apps/api && pnpm db:generate` | Generates a new migration from the schema diff | After modifying `src/database/schema.ts` |
| `cd apps/api && pnpm db:studio` | Opens Drizzle Studio (DB GUI) | Manual data inspection and editing |

---

## Default Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 3001 | http://localhost:3001 |
| API Backend | 3000 | http://localhost:3000 |
| API Swagger UI | 3000 | http://localhost:3000/api/v1/docs |
| PostgreSQL | 5432 | localhost:5432 |

---

## Troubleshooting

### `pnpm install` fails with a pnpm version error

The project enforces the exact version `pnpm@10.28.2` via `packageManager` in `package.json`.

**Solution:**
```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
```

---

### `pnpm dev` fails with "phase: command not found"

`pnpm dev` requires Phase. If you don't have access to the team's Phase project, use Path B described above:

```bash
pnpm dev:local   # reads variables from .env, no Phase required
```

---

### Database refuses connections

**Check that Docker is running:**
```bash
docker ps
```

**Check that the PostgreSQL container is started:**
```bash
docker compose -f docker-compose.dev.yaml ps
```

**Restart the container:**
```bash
pnpm db:stop
pnpm db:start
```

---

### API starts but migrations fail

The database variables in `.env` must exactly match those configured in `docker-compose.dev.yaml`.

**Check consistency:**
- `DB_USER` in `.env` must match `POSTGRES_USER` in Docker Compose
- `DB_DATABASE` in `.env` must match `POSTGRES_DB` in Docker Compose
- `DB_PASSWORD` in `.env` must match `POSTGRES_PASSWORD` in Docker Compose

---

### `@packages/api-sdk` not found or import error

The `api-sdk` package has no `dist/` directory — it must always be imported from its sources. If you configure Vitest in a new test, check that the alias is present in `vitest.config.ts`:

```ts
resolve: {
  alias: {
    "@packages/api-sdk": path.resolve(__dirname, "../../packages/api-sdk/src/index.ts"),
  },
}
```

---

### Pre-commit hook is too slow or blocks the commit

The pre-commit hook (`lint-staged`) runs `lint`, `check-types`, `test`, and `build` on every commit. This is intentional to guarantee code quality. If a test fails or the build is broken, fix the issue before committing.

---

### Environment variables are not being picked up

Environment variables are centralized in `packages/config/src/env.ts`. If you add a new variable, it must be declared in this file to be accessible on the API and frontend sides.

Make sure the `.env` file is at the **monorepo root** (not in `apps/api/` or `apps/front/`).
