import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator";
import { ContentsController } from "./application/controllers/contents.controller";
import { GetContentByIdUseCase } from "./application/use-cases/get-content-by-id.use-case";
import { QueryContentUseCase } from "./application/use-cases/query-content.use-case";
import { ContentsRepository } from "./infrastructure/database/repositories/contents.repository";

class ContentsModule extends RestModule {
  private readonly repository: ContentsRepository;
  private readonly queryContentsUseCase: QueryContentUseCase;
  private readonly getContentByIdUseCase: GetContentByIdUseCase;
  private readonly controller: ContentsController;
  private readonly decoratorRouter: DecoratorRouter;
  private readonly router: Router;

  constructor() {
    super({
      name: "Contents Module",
      description: "Module for managing contents",
    });

    this.repository = new ContentsRepository();

    this.queryContentsUseCase = new QueryContentUseCase(this.repository);
    this.getContentByIdUseCase = new GetContentByIdUseCase(this.repository);

    this.controller = new ContentsController(
      this.queryContentsUseCase,
      this.getContentByIdUseCase
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
