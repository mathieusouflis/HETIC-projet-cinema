# 🧪 Writing Tests

Tests are your safety net for refactors. Aim for fast unit tests, plus a few integration tests.

### What to test

* **Domain**: entities and pure business rules
* **Application**: use cases (mock interfaces)
* **Presentation**: request validation + controller behavior
* **Infrastructure**: repository integration against a test database (when needed)

### Common commands

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

If your repo defines them:

```bash
pnpm test:integration
pnpm test:e2e
```

{% hint style="info" %}
If a test is slow, push it down the pyramid. Mock at the use-case level.
{% endhint %}
