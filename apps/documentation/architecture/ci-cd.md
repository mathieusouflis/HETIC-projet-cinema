# CI/CD and Turborepo Pipeline

## GitHub Actions — Overview

Three workflow files live in `.github/workflows/`:

| Workflow | File | Trigger |
|---|---|---|
| `pre-merge` | `pull-request.yaml` | PR opened, synchronize, reopened, or ready_for_review |
| `deploy` (API) | `deploy-api.yaml` | Push to `main` — ignores frontend-only changes |
| `deploy` (Frontend) | `deploy-front.yaml` | Push to `main` — ignores API-only changes |

A reusable composite action handles dependency installation with caching:
`.github/actions/install-dependencies/action.yaml`

---

## `pre-merge` Workflow (`pull-request.yaml`)

Runs on every pull request event. Four jobs run **in parallel** — a PR is blocked if any one fails.

```mermaid
flowchart TD
    PR["Pull Request\n(opened / synchronize / reopened / ready_for_review)"]

    PR --> JB["Job: Build\npnpm build"]
    PR --> JCT["Job: Type Check\npnpm check-types"]
    PR --> JL["Job: Lint\npnpm lint (Biome)"]
    PR --> JT["Job: Test\npnpm test (Vitest)"]

    subgraph each_job["Each job — ubuntu-latest"]
        direction TB
        CHECKOUT["actions/checkout@v4"]
        INSTALL["install-dependencies\n(composite action)"]
        CMD["pnpm command"]
        CHECKOUT --> INSTALL --> CMD
    end
```

---

## Deploy Workflows

There are **two independent deploy workflows**, one per application. Each triggers on push to `main` but uses `paths-ignore` to skip when only unrelated files changed — a docs-only commit does not redeploy anything, and a frontend-only commit does not redeploy the API.

| Workflow | Skips deployment when all changed files are under… |
|---|---|
| `deploy-api.yaml` | `apps/front/`, `apps/docs/`, or `packages/api-sdk/` |
| `deploy-front.yaml` | `apps/api/` or `apps/docs/` |

Both share the same structure: **four validation jobs in parallel → one deploy job** gated on all four passing (`needs: [build, check-types, lint, test]`).

### API deploy (`deploy-api.yaml`)

```mermaid
flowchart TD
    PUSH["Push to main\n(API files changed)"]

    PUSH --> JB["Build\npnpm build"]
    PUSH --> JCT["Type Check\npnpm check-types"]
    PUSH --> JL["Lint\npnpm lint"]
    PUSH --> JT["Test\npnpm test"]

    JB & JCT & JL & JT --> DEPLOY

    subgraph DEPLOY["Job: Deploy API — environment: production"]
        direction TB
        D1["Checkout"]
        D2["Authenticate GCP\ngoogle-github-actions/auth@v2\n(GCP_SERVICE_ACCOUNT_KEY)"]
        D3["Set up gcloud CLI\n(install_components: beta)"]
        D4["Configure Docker for GCR\ngcloud auth configure-docker"]
        D5["Install Phase CLI"]
        D6["Export secrets from Phase\n--app hetic-cinema --env production\n→ /tmp/.env.prod.yaml + GITHUB_ENV"]
        D7["Build API image\ndocker build apps/api/Dockerfile\ntag: gcr.io/GCP_PROJECT/cinema-api:GITHUB_SHA"]
        D8["Push API image → GCR"]
        D9["Deploy\ngcloud run deploy cinema-api\n--region europe-west1\n--env-vars-file /tmp/.env.prod.yaml\n--port BACKEND_PORT\n--allow-unauthenticated"]

        D1 --> D2 --> D3 --> D4 --> D5 --> D6 --> D7 --> D8 --> D9
    end
```

### Frontend deploy (`deploy-front.yaml`)

```mermaid
flowchart TD
    PUSH["Push to main\n(Frontend files changed)"]

    PUSH --> JB["Build\npnpm build"]
    PUSH --> JCT["Type Check\npnpm check-types"]
    PUSH --> JL["Lint\npnpm lint"]
    PUSH --> JT["Test\npnpm test"]

    JB & JCT & JL & JT --> DEPLOY

    subgraph DEPLOY["Job: Deploy Frontend — environment: production"]
        direction TB
        D1["Checkout"]
        D2["Authenticate GCP\n(GCP_SERVICE_ACCOUNT_KEY)"]
        D3["Set up gcloud CLI"]
        D4["Configure Docker for GCR"]
        D5["Install Phase CLI"]
        D6["Export secrets from Phase\n→ /tmp/.env.prod.yaml + GITHUB_ENV"]
        D7["Build Frontend image\ndocker build apps/front/Dockerfile\n--build-arg VITE_BACKEND_API_URL\n--build-arg VITE_PUBLIC_POSTHOG_KEY\n--build-arg VITE_PUBLIC_POSTHOG_HOST\ntag: gcr.io/GCP_PROJECT/cinema-front:GITHUB_SHA"]
        D8["Push Frontend image → GCR"]
        D9["Deploy\ngcloud run deploy cinema-front\n--region europe-west1\n--env-vars-file /tmp/.env.prod.yaml\n--port FRONTEND_PORT\n--allow-unauthenticated"]
        D10["Clean up\nrm -f /tmp/.env.prod.yaml"]

        D1 --> D2 --> D3 --> D4 --> D5 --> D6 --> D7 --> D8 --> D9 --> D10
    end
```

**Key differences between the two deploy jobs:**
- The **frontend image** receives `VITE_BACKEND_API_URL`, `VITE_PUBLIC_POSTHOG_KEY`, and `VITE_PUBLIC_POSTHOG_HOST` as Docker `--build-arg`s. Vite bakes these into the static bundle at build time — they cannot be injected at runtime.
- The **API image** receives no build args — all config comes from the Cloud Run `--env-vars-file` at runtime.
- Cloud Run `--port` is set from `BACKEND_PORT` (API) and `FRONTEND_PORT` (frontend), both coerced to integers with `$(( PORT + 0 ))` before the `gcloud` call.

---

## Secrets injection (Phase → Cloud Run)

Both deploy workflows use the same Phase export pattern:

```bash
# 1. Export from Phase as YAML
phase secrets export --app hetic-cinema --env production --format yaml \
  > /tmp/.env.prod.raw.yaml

# 2. Coerce all values to strings (required by Cloud Run's --env-vars-file format)
yq e -o=yaml 'with_entries(.value |= tostring)' /tmp/.env.prod.raw.yaml \
  > /tmp/.env.prod.yaml

# 3. Also inject into GITHUB_ENV for use in subsequent steps (e.g. Docker build args)
yq e -r 'to_entries | .[] | "\(.key)=\(.value|tostring)"' /tmp/.env.prod.raw.yaml \
  >> "$GITHUB_ENV"
```

`PHASE_SERVICE_TOKEN` is stored as a GitHub Actions secret and passed to the export step as `env:`.

---

## Composite Action: `install-dependencies`

Reused by every job in all three workflows.

```mermaid
flowchart TD
    A["actions/setup-node@v4\n(Node.js 24, configurable via node-version input)"]
    B["pnpm/action-setup@v4\n(reads version from package.json packageManager field)"]
    C["actions/cache@v4\nCache pnpm store\nkey: runner.os + hash(pnpm-lock.yaml)"]
    D["actions/cache@v4\nCache Turborepo (.turbo/)\nkey: runner.os + github.sha"]
    E["pnpm install"]

    A --> B --> C --> D --> E
```

Two independent caches are maintained:
- **pnpm store**: keyed on `pnpm-lock.yaml` hash — stable across commits when dependencies don't change
- **Turborepo cache** (`.turbo/`): keyed on commit SHA with prefix fallback — unchanged packages skip rebuilding within the same workflow run

---

## Turborepo Pipeline

Turborepo orchestrates tasks in dependency order per `turbo.json`. Cached outputs are replayed when inputs (sources + env) haven't changed.

```mermaid
graph TD
    subgraph cached["Cached tasks"]
        GEN["generate-sdk\n(depends on ^generate-sdk)"]
        BUILD["build\n(depends on ^build)\noutputs: build/**, dist/**"]
        CT["check-types\n(depends on ^build)"]
        LINT["lint\n(depends on ^build)"]
        TEST["test\n(depends on ^build)\noutputs: coverage/**"]
    end

    subgraph nocache["Non-cached / persistent tasks"]
        DEV["dev (persistent)\n(depends on ^build)"]
        BUILDW["build:watch (persistent)\n(depends on ^build)"]
        MIGRATE["db:migrate\n(no cache — DB side effect)"]
        START["start (persistent)\n(depends on build)"]
    end

    GEN --> BUILD
    BUILD --> CT
    BUILD --> LINT
    BUILD --> TEST
    BUILD --> DEV
    BUILD --> BUILDW
    BUILD --> START
```

`^build` means "upstream packages in the dependency graph must build first". `persistent` tasks (dev servers) run indefinitely and are never cached.

---

## Pre-commit Hook (local)

Husky runs `lint-staged` on every commit:

```
.husky/pre-commit → lint-staged (lint-staged.config.js)
```

The staged-file pipeline mirrors CI:
1. `pnpm lint` (Biome)
2. `pnpm check-types --affected`
3. `pnpm test`
4. `pnpm build`

A commit only succeeds locally if it would also pass CI.

---

## Required GitHub Secrets

| Secret | Used by | Purpose |
|---|---|---|
| `GCP_SERVICE_ACCOUNT_KEY` | Both deploy workflows | GCP authentication (JSON key) |
| `PHASE_SERVICE_TOKEN` | Both deploy workflows | Phase CLI authentication for secrets export |
