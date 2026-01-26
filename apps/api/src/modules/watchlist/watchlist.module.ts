import { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { IWatchlistRepository } from "./domain/interfaces/IWatchlistRepository.js";
import { WatchlistController } from "./application/controllers/watchlist.controller.js";
import { WatchlistRepository } from "./infrastructure/repositories/watchlist.repository.js";
import { ListWatchlistUseCase } from "./application/use-cases/list-watchlist.use-case.js";
import { AddWatchlistContentUseCase } from "./application/use-cases/add-watchlist-content.use-case.js";
import { IContentRepository } from "../contents/domain/interfaces/IContentRepository.js";
import { ContentsRepository } from "../contents/infrastructure/database/repositories/content/contents.repository.js";
import { GetWatchlistByContentIdUseCase } from "./application/use-cases/get-watchlist-content.use-case.js";
import { GetWatchlistByIdUseCase } from "./application/use-cases/get-watchlist.use-case.js";

class WatchlistModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================


  private readonly repository: IWatchlistRepository;
  private readonly contentRepository: IContentRepository

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly listWatchlistUseCase: ListWatchlistUseCase;
  private readonly addWatchlistContentUseCase: AddWatchlistContentUseCase;
  private readonly getWatchlistByContentIdUseCase: GetWatchlistByContentIdUseCase;
  private readonly getWatchlistByIdUseCase: GetWatchlistByIdUseCase;

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
    this.contentRepository = new ContentsRepository()

    this.listWatchlistUseCase = new ListWatchlistUseCase(this.repository)
    this.addWatchlistContentUseCase = new AddWatchlistContentUseCase(this.repository, this.contentRepository)
    this.getWatchlistByContentIdUseCase = new GetWatchlistByContentIdUseCase(this.repository)
    this.getWatchlistByIdUseCase = new GetWatchlistByIdUseCase(this.repository)

    this.controller = new WatchlistController(this.listWatchlistUseCase, this.addWatchlistContentUseCase, this.getWatchlistByIdUseCase, this.getWatchlistByContentIdUseCase);


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
