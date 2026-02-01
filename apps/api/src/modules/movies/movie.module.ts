import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { MoviesController } from "./application/controllers/movie.controller.js";
import { GetMovieByIdUseCase } from "./application/use-cases/get-movie-by-id.use-case.js";
import { QueryMovieUseCase } from "./application/use-cases/query-movie.use-case.js";
import type { IMoviesRepository } from "./domain/interfaces/IMoviesRepository.js";
import { CompositeMoviesRepository } from "./infrastructure/database/repositories/composite-movies.repository.js";

class MoviesModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly repository: IMoviesRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly queryMoviesUseCase: QueryMovieUseCase;
  private readonly getMovieByIdUseCase: GetMovieByIdUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: MoviesController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Users Module",
      description: "Module for managing users",
    });

    this.repository = new CompositeMoviesRepository();

    this.queryMoviesUseCase = new QueryMovieUseCase(this.repository);
    this.getMovieByIdUseCase = new GetMovieByIdUseCase(this.repository);
    this.controller = new MoviesController(
      this.queryMoviesUseCase,
      this.getMovieByIdUseCase
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getMoviesRepository(): IMoviesRepository {
    return this.repository;
  }

  public getController(): MoviesController {
    return this.controller;
  }
}

export const moviesModule = new MoviesModule();
