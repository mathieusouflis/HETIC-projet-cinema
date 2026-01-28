import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { ContentsController } from "./application/controllers/contents.controller.js";
import { GetContentByIdUseCase } from "./application/use-cases/get-content-by-id.use-case.js";
import { QueryContentUseCase } from "./application/use-cases/query-content.use-case.js";
import { SearchContentsUseCase } from "./application/use-cases/search-contents.use-case.js";
import { ContentsRepository } from "./infrastructure/database/repositories/content/contents.repository.js";

class ContentsModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly repository: ContentsRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly queryContentsUseCase: QueryContentUseCase;
  private readonly getContentByIdUseCase: GetContentByIdUseCase;
  private readonly searchContentsUseCase: SearchContentsUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: ContentsController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Users Module",
      description: "Module for managing users",
    });

    this.repository = new ContentsRepository();

    this.queryContentsUseCase = new QueryContentUseCase(this.repository);
    this.getContentByIdUseCase = new GetContentByIdUseCase(this.repository);
    this.searchContentsUseCase = new SearchContentsUseCase(this.repository);
    this.controller = new ContentsController(
      this.queryContentsUseCase,
      this.getContentByIdUseCase,
      this.searchContentsUseCase
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getContentsRepository(): ContentsRepository {
    return this.repository;
  }

  public getController(): ContentsController {
    return this.controller;
  }
}

export const contentsModule = new ContentsModule();
