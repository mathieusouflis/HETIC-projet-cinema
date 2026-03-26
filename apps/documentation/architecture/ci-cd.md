# CI/CD and Turborepo Pipeline

## GitHub Actions — Overview

Two GitHub Actions workflows are defined in `.github/workflows/`:

| Workflow | File | Trigger |
|---|---|---|
| `pre-merge` | `pull-request.yaml` | PR opened, synchronized, or reopened on any branch |
| `deploy` | `deploy.yaml` | Push to `main` branch |

A reusable composite action handles dependency installation with caching:
`.github/actions/install-dependencies/action.yaml`

---

## `pre-merge` Workflow (Pull Requests)

```mermaid
flowchart TD
    PR["Pull Request\n(opened / synchronize / reopened\n/ ready_for_review)"]

    PR --> JB["Job: Build\npnpm build"]
    PR --> JCT["Job: Type Check\npnpm check-types"]
    PR --> JL["Job: Lint\npnpm lint (Biome)"]
    PR --> JT["Job: Test\npnpm test (Vitest)"]

    subgraph each_job["Each job (ubuntu-latest)"]
        direction TB
        CHECKOUT["actions/checkout@v4"]
        INSTALL["install-dependencies\n(composite action)"]
        CMD["pnpm command"]
        CHECKOUT --> INSTALL --> CMD
    end
```

The four jobs are **independent** and run in parallel. No dependency between them — a PR can be blocked by any one of them.

---

## `deploy` Workflow (Production Deployment)

```mermaid
flowchart TD
    PUSH["Push to main"]

    PUSH --> JB["Job: Build\npnpm build"]
    PUSH --> JCT["Job: Type Check\npnpm check-types"]
    PUSH --> JL["Job: Lint\npnpm lint"]
    PUSH --> JT["Job: Test\npnpm test"]

    JB & JCT & JL & JT --> DEPLOY

    subgraph DEPLOY["Job: Deploy to Cloud Run\n(environment: production)"]
        direction TB
        D1["Checkout"]
        D2["Authenticate GCP\n(google-github-actions/auth@v2)"]
        D3["Setup gcloud CLI\n(install_components: beta)"]
        D4["Configure Docker for GCR\ngcloud auth configure-docker"]
        D5["Install Phase CLI\n(secrets manager)"]
        D6["Export secrets from Phase\n(YAML format → /tmp/.env.prod.yaml)"]
        D7["Build API image\ndocker build apps/api/Dockerfile\ntag: gcr.io/PROJECT/cinema-api:SHA"]
        D8["Push API image\ndocker push GCR"]
        D9["Deploy API\ngcloud run deploy cinema-api\nregion: europe-west1"]
        D10["Build Frontend image\ndocker build apps/front/Dockerfile\nbuild-args: VITE_BACKEND_API_URL, POSTHOG"]
        D11["Push Frontend image\ndocker push GCR"]
        D12["Deploy Frontend\ngcloud run deploy cinema-front\nregion: europe-west1"]

        D1 --> D2 --> D3 --> D4 --> D5 --> D6
        D6 --> D7 --> D8 --> D9
        D6 --> D10 --> D11 --> D12
    end
```

**Deployment condition:** the `deploy` job only starts if all four validation jobs (`build`, `check-types`, `lint`, `test`) have succeeded (`needs: [build, check-types, lint, test]`).

**Target platform:** Google Cloud Run (region `europe-west1`). Docker images are pushed to Google Container Registry (GCR).

**Secrets management:** Phase.dev is used as the secrets manager. The Phase CLI exports secrets from the `production` environment of the `hetic-cinema` app in YAML, then `yq` converts them to the format expected by Cloud Run.

---

## Composite Action: `install-dependencies`

```mermaid
flowchart TD
    A["actions/setup-node@v4\n(Node.js 24 by default)"]
    B["pnpm/action-setup@v4\n(installs pnpm)"]
    C["actions/cache@v4\nCache pnpm store\nkey: OS + hash(pnpm-lock.yaml)"]
    D["actions/cache@v4\nCache Turborepo (.turbo/)\nkey: OS + github.sha"]
    E["pnpm install\n(--frozen-lockfile implicit)"]

    A --> B --> C --> D --> E
```

This action is reused in each job of both workflows. It caches:
- The pnpm store (based on `pnpm-lock.yaml`)
- The Turborepo cache (based on the commit SHA)

---

## Turborepo Pipeline (tasks and dependencies)

Turborepo orchestrates tasks respecting the dependency graph declared in `turbo.json`. Cache is enabled by default unless stated otherwise.

```mermaid
graph TD
    subgraph cached["Cached tasks"]
        GEN["generate-sdk\n(depends on ^generate-sdk)"]
        BUILD["build\n(depends on ^build)\noutputs: build/**, dist/**"]
        CT["check-types\n(depends on ^build)"]
        LINT["lint\n(depends on ^build)"]
        TEST["test\n(depends on ^build)\noutputs: coverage/**"]
    end

    subgraph nocache["Non-cached tasks"]
        DEV["dev\n(persistent)\n(depends on ^build)"]
        BUILDW["build:watch\n(persistent)\n(depends on ^build)"]
        MIGRATE["db:migrate"]
        START["start\n(persistent)\n(depends on build)"]
    end

    GEN --> BUILD
    BUILD --> CT
    BUILD --> LINT
    BUILD --> TEST
    BUILD --> DEV
    BUILD --> BUILDW
    BUILD --> START
```

**Graph reading:**
- `^build` means "the package must have built its upstream dependencies before running this task".
- Tasks `dev`, `build:watch`, and `start` are `persistent` (long-running processes, no expected end).
- `db:migrate` has no declared dependency and its cache is disabled (side effects on the database).

**Turborepo cache:** Turbo hashes inputs (sources, env variables) and replays cached outputs if nothing has changed. In CI, the `.turbo/` cache is restored via the composite action, avoiding rebuilding unmodified packages between runs.

---

## Pre-commit Hook (local)

Outside of CI, a Husky hook runs on every local commit via `lint-staged`:

```
.husky/pre-commit → lint-staged
```

`lint-staged.config.js` triggers on all staged files:
1. `pnpm lint` (Biome)
2. `pnpm check-types --affected`
3. `pnpm test`
4. `pnpm build`

This local pipeline is identical to CI, ensuring a commit can only pass locally if it would also pass in CI.
