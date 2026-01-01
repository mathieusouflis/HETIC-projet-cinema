# 🆕 Creating a New Module

Add new features by creating a module. Keep it consistent with existing ones (`auth`, `users`).

### Before you start

Read these once:

* [Architecture Overview](../../api/architecture/)
* [Project Structure](../../api/architecture/project-structure.md)

### Module checklist

{% stepper %}
{% step %}
### Create the module skeleton

Create a folder under `apps/api/src/modules/<module-name>/` with:

* `domain/` (entities, interfaces, domain errors)
* `application/` (DTOs, validators, use cases, controllers)
* `infrastructure/` (repositories, schemas, external services)
* `presentation/` (routes)
* `<module-name>.module.ts` (wiring / DI)
{% endstep %}

{% step %}
### Start in domain

Define:

* Entities (business rules)
* Interfaces (ports), like repositories or services
* Domain errors for business violations
{% endstep %}

{% step %}
### Add use cases + validation

Implement use cases in `application/use-cases/`.

Validate inputs at the boundary (Zod schemas in `application/validators/`).
{% endstep %}

{% step %}
### Wire infrastructure and routes

Implement repository interfaces in `infrastructure/`.

Expose routes in `presentation/routes/`.
{% endstep %}

{% step %}
### Add migrations + tests

If you added tables:

```bash
pnpm db:generate
pnpm db:migrate
```

Add tests for the new behavior.
{% endstep %}
{% endstepper %}

### Quick sanity checks

```bash
pnpm test
pnpm lint
pnpm type-check
```
