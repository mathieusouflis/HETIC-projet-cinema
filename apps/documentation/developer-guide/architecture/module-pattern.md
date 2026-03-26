# Module Pattern

Every feature in the API is encapsulated in a self-contained **module**. This document explains the full lifecycle of a module: its directory structure, how dependencies are wired, how it registers itself with the router, and how it is mounted by the server.

---

## Directory structure

All modules live under `apps/api/src/modules/<module-name>/` and follow this three-layer layout:

```
module-name/
├── application/
│   ├── controllers/       # *.controller.ts — HTTP request handlers
│   ├── dto/               # Request/response DTOs and Zod validators
│   └── use-cases/         # *.usecase.ts — one file per business operation
├── domain/
│   ├── entities/          # *.entity.ts — pure domain objects
│   ├── interfaces/        # I*.ts — repository/service contracts
│   └── interfaces/        # *.repository.mock..ts — mock factories for tests
└── infrastructure/
    └── database/
        └── repositories/  # Drizzle ORM implementations
<module-name>.module.ts    # Wires everything together (manual DI)
```

**Dependency direction**: infrastructure → application → domain. Domain has zero external imports. Use cases never import from infrastructure directly.

---

## The `RestModule` base class

Every module extends `RestModule` (in `src/shared/infrastructure/base/modules/rest-module.ts`):

```typescript
export abstract class RestModule extends BaseModule implements RestModuleInterface {
  abstract getRouter(): Router;
}
```

`BaseModule` holds module metadata (`name`, `description`). `RestModule` adds the contract that every module must expose an Express `Router`.

---

## Manual dependency injection in the constructor

There is no DI container. Each module's constructor wires all of its dependencies by hand in the correct order: repositories first, then services, then use cases, then the controller, then the router.

Here is the `UsersModule` as a concise example:

```typescript
class UsersModule extends RestModule {
  // 1. Infrastructure
  private readonly userRepository: UserRepository;

  // 2. Use cases
  private readonly getUserByIdUseCase: GetUserByIdUseCase;
  private readonly getMeUseCase: GetMeUseCase;
  // …more use cases

  // 3. Presentation
  private readonly controller: UsersController;
  private readonly decoratorRouter: DecoratorRouter;
  private readonly router: Router;

  constructor() {
    super({ name: "Users Module", description: "Module for managing users" });

    // Infrastructure
    this.userRepository = new UserRepository();

    // Use cases injected with their repository dependencies
    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getMeUseCase = new GetMeUseCase(this.userRepository);

    // Controller injected with use cases
    this.controller = new UsersController(
      this.getUserByIdUseCase,
      this.getMeUseCase,
      // …
    );

    // Router built from controller decorators
    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }
}

export const usersModule = new UsersModule();
```

The module is instantiated once as a singleton (`export const usersModule = new UsersModule()`). The constructor runs at import time, so all dependencies are ready before the server starts.

---

## How `DecoratorRouter` builds the router

`DecoratorRouter.generateRouter(controller)` reads the metadata written by route decorators (`@Controller`, `@Get`, `@Post`, etc.) on the controller class and generates an Express `Router` from it. Each decorated method becomes a route handler.

See [Decorator System](decorator-system.md) for the full explanation.

---

## Module registration

All modules are registered in `apps/api/src/modules/index.ts` using the `ModuleRegistry` singleton:

```typescript
function registerModules(): void {
  moduleRegistry.register("auth", authModule);
  moduleRegistry.register("users", usersModule);
  moduleRegistry.register("categories", categoriesModule);
  moduleRegistry.register("contents", contentsModule);
  moduleRegistry.register("movies", moviesModule);
  moduleRegistry.register("series", seriesModule);
  moduleRegistry.register("watchlist", watchlistModule);
  moduleRegistry.register("peoples", peoplesModule);
  moduleRegistry.register("watchparties", watchpartyModule);
  moduleRegistry.register("friendships", friendshipsModule);
  moduleRegistry.register("conversations", conversationsModule);
  moduleRegistry.register("messages", messagesModule);
}
```

`ModuleRegistry` is a `Map<string, IApiModule>`. Registration throws if a name is reused, which prevents accidental duplicates.

---

## How modules are mounted on the Express app

`apiVersion1Router()` calls `registerModules()`, then iterates over every registered module and mounts its router:

```typescript
export function apiVersion1Router(): Router {
  const router = Router();
  registerModules();

  const modules = moduleRegistry.getAllModules();
  for (const module of modules) {
    router.use(module.getRouter());  // each module's router has its own prefix from @Controller
  }

  // OpenAPI spec is aggregated and served at /api/v1/docs
  const openApiSpec = generateOpenAPISpec();
  router.get("/openapi.json", (_, res) => res.json(openApiSpec));
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  return router;
}
```

This router is then mounted at `/api/v1` in `server.ts`:

```typescript
app.use("/api/v1", apiVersion1Router());
```

---

## Lifecycle summary

```
pnpm dev
  → server.ts: createServer()
    → modules/index.ts: apiVersion1Router()
      → registerModules()
        → each *.module.ts singleton is imported
          → constructor runs: repos → services → use cases → controller → router
        → moduleRegistry.register(name, module)
      → for each module: router.use(module.getRouter())
      → OpenAPI spec aggregated from all controller metadata
    → app.use("/api/v1", apiV1Router)
  → index.ts: httpServer.listen(port)
```

---

## Rules

- **One module per domain feature.** Do not mix concerns across modules.
- **Cross-module access**: if module A needs a repository from module B (e.g. `AuthModule` needs `UserRepository`), import and instantiate the concrete class directly — do not go through the other module's singleton.
- **Never import from infrastructure in domain**. Domain interfaces define the contract; infrastructure implements it.
- **No framework imports in use cases**. Use cases must be testable without Express or Drizzle running.

---

## Adding a new module

The full step-by-step walkthrough is in [Creating a Module](../guides/creating-a-module.md).
