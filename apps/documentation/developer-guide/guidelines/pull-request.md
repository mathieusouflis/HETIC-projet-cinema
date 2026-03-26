# Pull Request Guide

---

## Branch strategy

All work branches off `main`. There are no long-lived feature branches or develop branches.

```
main ← feat/add-reviews-module
main ← fix/watchlist-duplicate-409
main ← docs/decorator-system
```

Name your branch with the commit type as prefix:

```
feat/<short-description>
fix/<short-description>
refactor/<short-description>
docs/<short-description>
chore/<short-description>
```

Keep descriptions in **kebab-case** and under 40 characters.

---

## Before opening a PR

Run the full local validation suite and make sure everything is green:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

If you changed an API endpoint:
```bash
pnpm generate-sdk
```

If you changed the DB schema:
```bash
cd apps/api && pnpm db:generate && pnpm db:migrate
```

---

## PR size

**Keep PRs small and focused.** A PR should do one thing. If you are tempted to write "and also…" in the summary, split the PR.

| Scenario | Guidance |
|---|---|
| New module (schema + use cases + controller) | One PR is fine |
| Refactor + new feature | Split into two PRs |
| Bug fix + unrelated cleanup | Split into two PRs |
| 10+ files changed | Consider splitting if the changes are independent |

Small PRs are reviewed faster, merged sooner, and create cleaner git history.

---

## PR description

Fill out every section of the PR template:

- **Summary** — what changed and why (2–3 sentences max)
- **Type of change** — check the right box
- **Changes** — bullet list of the notable changes
- **Testing** — what you verified and what tests you added
- **Checklist** — confirm lint/types/tests/build pass

The "why" is more important than the "what". The diff shows what changed; the description should explain the motivation.

---

## Review process

1. Open the PR and **request a review** from at least one maintainer
2. CI runs automatically — all four jobs (build, type-check, lint, test) must be green
3. Address review comments with new commits — do not force-push while a review is in progress
4. Once approved and CI is green, the PR is merged by a maintainer

---

## Merge strategy

- **Squash and merge** for small PRs (1–3 commits) — produces a clean single commit on `main`
- **Rebase and merge** for multi-commit PRs where each commit is meaningful on its own
- **Merge commit** only when preserving branch history is intentional (rare)

After merge, delete the branch.

---

## Breaking changes

If your PR changes a public contract (API response shape, environment variable name, cookie name), mark it explicitly:

1. Add `BREAKING CHANGE:` in the commit footer
2. Note it in the PR summary
3. Update the documentation

---

## Draft PRs

Open a **draft PR** early when you want feedback on direction before the implementation is complete. Mark it ready for review once the checklist is satisfied.
