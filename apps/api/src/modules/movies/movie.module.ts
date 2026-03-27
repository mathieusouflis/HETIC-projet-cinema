import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator";
import { MoviesController } from "./application/controllers/movie.controller";
import { GetMovieByIdUseCase } from "./application/use-cases/get-movie-by-id.use-case";
import { QueryMovieUseCase } from "./application/use-cases/query-movie.use-case";
import type { IMoviesRepository } from "./domain/interfaces/IMoviesRepository";
import { CompositeMoviesRepository } from "./infrastructure/database/repositories/composite-movies.repository";

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
