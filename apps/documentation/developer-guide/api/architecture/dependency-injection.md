# 💉 Dependency Injection

Dependencies are passed in. They are not imported and constructed deep inside your logic.

#### Why DI matters here

* Use cases stay testable.
* Implementations can change (DB, services) without rewriting business logic.
* The dependency graph stays explicit.

#### The rule

* Use cases depend on **interfaces**.
* Infrastructure provides **implementations**.
* Modules wire everything together.

#### Where wiring happens

Look for `<module>.module.ts`.

That file typically:

* creates repository/service instances
* creates use cases with those dependencies
* creates controllers
* exposes a router

#### Testing tip

In unit tests, inject fakes/mocks for repository interfaces.

This keeps tests fast and deterministic.
