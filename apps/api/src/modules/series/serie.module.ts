import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { SeriesController } from "./application/controllers/serie.controller.js";
import { GetSerieByIdUseCase } from "./application/use-cases/get-serie-by-id.use-case.js";
import { QuerySerieUseCase } from "./application/use-cases/query-serie.use-case.js";
import type { ISeriesRepository } from "./domain/interfaces/ISeriesRepository.js";
import { CompositeSeriesRepository } from "./infrastructure/database/repositories/composite-series.repository.js";

class SeriesModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly repository: ISeriesRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly querySeriesUseCase: QuerySerieUseCase;
  private readonly getSerieByIdUseCase: GetSerieByIdUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: SeriesController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Users Module",
      description: "Module for managing users",
    });

    this.repository = new CompositeSeriesRepository();

    this.querySeriesUseCase = new QuerySerieUseCase(this.repository);
    this.getSerieByIdUseCase = new GetSerieByIdUseCase(this.repository);
    this.controller = new SeriesController(
      this.querySeriesUseCase,
      this.getSerieByIdUseCase
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getSeriesRepository(): ISeriesRepository {
    return this.repository;
  }

  public getController(): SeriesController {
    return this.controller;
  }
}

export const seriesModule = new SeriesModule();
