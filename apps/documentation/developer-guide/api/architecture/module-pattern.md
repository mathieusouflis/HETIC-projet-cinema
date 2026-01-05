# 🧩 Module Pattern

Each feature lives in a self-contained module. Think `auth`, `users`, and future modules.

### Why this pattern exists

- Keeps related code together.
- Makes boundaries obvious.
- Lets you test features in isolation.
- Makes ownership easier in a team.

### Module layout

You’ll see this shape under `apps/api/src/modules/<module>/`:

```
<module>/
├── domain/           # entities, interfaces, domain errors
├── application/      # DTOs, validators, use cases, controllers
├── infrastructure/   # repositories, schemas, external services
├── presentation/     # routes (HTTP)
└── <module>.module.ts
```

### Dependency direction

Dependencies must point inward.

- `presentation` depends on `application`.
- `application` depends on `domain`.
- `infrastructure` implements `domain` interfaces.

If you need a refresher, read:

- [Clean Architecture Principles](clean-architecture.md)

### Practical rules

- Don’t import Express types in `domain/`.
- Don’t query the DB from controllers.
- Keep use cases framework-free.

### Next step

Build your first feature module:

- [Creating a New Module](../../strategy/api/creating-a-new-module.md)
