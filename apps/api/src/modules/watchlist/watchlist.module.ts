import { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { IWatchlistRepository } from "./domain/interfaces/IWatchlistRepository.js";
import { WatchlistController } from "./application/controllers/watchlist.controller.js";
import { WatchlistRepository } from "./infrastructure/repositories/watchlist.repository.js";
import { ListWatchlistUseCase } from "./application/use-cases/list-watchlist.use-case.js";
import { GetWatchlistContentUseCase } from "./application/use-cases/get-watchlist-content.use-case.js";

class WatchlistModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================


  private readonly repository: IWatchlistRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly listWatchlistUseCase: ListWatchlistUseCase;
  private readonly getWatchlistContentUseCase: GetWatchlistContentUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: WatchlistController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Users Module",
      description: "Module for managing users"
    })


    this.repository = new WatchlistRepository()

    this.listWatchlistUseCase = new ListWatchlistUseCase(this.repository)
    this.getWatchlistContentUseCase = new GetWatchlistContentUseCase(this.repository)

    this.controller = new WatchlistController(this.listWatchlistUseCase, this.getWatchlistContentUseCase);


    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }


  public getMoviesRepository(): IWatchlistRepository {
    return this.repository;
  }


  public getController(): WatchlistController {
    return this.controller;
  }
}

export const watchlistModule = new WatchlistModule();
