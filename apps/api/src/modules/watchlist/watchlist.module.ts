import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator";
import type { IContentRepository } from "../contents/domain/interfaces/IContentRepository";
import { ContentsRepository } from "../contents/infrastructure/database/repositories/contents.repository";
import type { IRatingRepository } from "../ratings/domain/interfaces/IRatingRepository";
import { RatingRepository } from "../ratings/infrastructure/repositories/rating.repository";
import { WatchlistController } from "./application/controllers/watchlist.controller";
import { AddWatchlistContentUseCase } from "./application/use-cases/add-watchlist-content.use-case";
import { DeleteWatchlistByIdUseCase } from "./application/use-cases/delete-watchlist.use-case";
import { DeleteWatchlistByContentIdUseCase } from "./application/use-cases/delete-watchlist-by-content.use-case";
import { GetWatchlistByIdUseCase } from "./application/use-cases/get-watchlist.use-case";
import { GetWatchlistByContentIdUseCase } from "./application/use-cases/get-watchlist-content.use-case";
import { ListWatchlistUseCase } from "./application/use-cases/list-watchlist.use-case";
import { PatchWatchlistByIdUseCase } from "./application/use-cases/patch-watchlist.use-case";
import { PutWatchlistByContentIdUseCase } from "./application/use-cases/put-watchlist-by-content.use-case";
import type { IWatchlistRepository } from "./domain/interfaces/IWatchlistRepository";
import { WatchlistRepository } from "./infrastructure/repositories/watchlist.repository";

class WatchlistModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly repository: IWatchlistRepository;
  private readonly contentRepository: IContentRepository;
  private readonly ratingRepository: IRatingRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly listWatchlistUseCase: ListWatchlistUseCase;
  private readonly addWatchlistContentUseCase: AddWatchlistContentUseCase;
  private readonly getWatchlistByContentIdUseCase: GetWatchlistByContentIdUseCase;
  private readonly getWatchlistByIdUseCase: GetWatchlistByIdUseCase;
  private readonly patchWatchlistByIdUseCase: PatchWatchlistByIdUseCase;
  private readonly putWatchlistByContentIdUseCase: PutWatchlistByContentIdUseCase;
  private readonly deleteWatchlistByIdUseCase: DeleteWatchlistByIdUseCase;
  private readonly deleteWatchlistByContentIdUseCase: DeleteWatchlistByContentIdUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: WatchlistController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Users Module",
      description: "Module for managing users",
    });

    this.repository = new WatchlistRepository();
    this.contentRepository = new ContentsRepository();
    this.ratingRepository = new RatingRepository();

    this.listWatchlistUseCase = new ListWatchlistUseCase(this.repository);
    this.addWatchlistContentUseCase = new AddWatchlistContentUseCase(
      this.repository,
      this.contentRepository
    );
    this.getWatchlistByContentIdUseCase = new GetWatchlistByContentIdUseCase(
      this.repository
    );
    this.getWatchlistByIdUseCase = new GetWatchlistByIdUseCase(this.repository);
    this.patchWatchlistByIdUseCase = new PatchWatchlistByIdUseCase(
      this.repository
    );
    this.putWatchlistByContentIdUseCase = new PutWatchlistByContentIdUseCase(
      this.repository,
      this.ratingRepository
    );
    this.deleteWatchlistByIdUseCase = new DeleteWatchlistByIdUseCase(
      this.repository
    );
    this.deleteWatchlistByContentIdUseCase =
      new DeleteWatchlistByContentIdUseCase(this.repository);

    this.controller = new WatchlistController(
      this.listWatchlistUseCase,
      this.addWatchlistContentUseCase,
      this.getWatchlistByIdUseCase,
      this.getWatchlistByContentIdUseCase,
      this.patchWatchlistByIdUseCase,
      this.putWatchlistByContentIdUseCase,
      this.deleteWatchlistByIdUseCase,
      this.deleteWatchlistByContentIdUseCase
    );

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
