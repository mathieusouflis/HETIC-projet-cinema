import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator";
import type { IContentRepository } from "../contents/domain/interfaces/IContentRepository";
import { ContentsRepository } from "../contents/infrastructure/database/repositories/contents.repository";
import { WatchpartyController } from "./application/controllers/watchparty.controller";
import { CreateWatchpartyUseCase } from "./application/use-cases/create-watchparty.use-case";
import { DeleteWatchpartyUseCase } from "./application/use-cases/delete-watchparty.use-case";
import { GetWatchpartyUseCase } from "./application/use-cases/get-watchparty.use-case";
import { ListWatchpartiesUseCase } from "./application/use-cases/list-watchparties.use-case";
import { UpdateWatchpartyUseCase } from "./application/use-cases/update-watchparty.use-case";
import type { IWatchpartyRepository } from "./domain/interfaces/IWatchpartyRepository";
import { WatchpartyRepository } from "./infrastructure/repositories/watchparty.repository";

class WatchpartyModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly repository: IWatchpartyRepository;
  private readonly contentRepository: IContentRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly listWatchpartiesUseCase: ListWatchpartiesUseCase;
  private readonly getWatchpartyUseCase: GetWatchpartyUseCase;
  private readonly createWatchpartyUseCase: CreateWatchpartyUseCase;
  private readonly updateWatchpartyUseCase: UpdateWatchpartyUseCase;
  private readonly deleteWatchpartyUseCase: DeleteWatchpartyUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: WatchpartyController;
  private readonly decoratorRouter: DecoratorRouter;
  private readonly router: Router;

  constructor() {
    super({
      name: "Watchparty Module",
      description: "Module for managing watchparties",
    });

    this.repository = new WatchpartyRepository();
    this.contentRepository = new ContentsRepository();

    this.listWatchpartiesUseCase = new ListWatchpartiesUseCase(this.repository);
    this.getWatchpartyUseCase = new GetWatchpartyUseCase(this.repository);
    this.createWatchpartyUseCase = new CreateWatchpartyUseCase(
      this.repository,
      this.contentRepository
    );
    this.updateWatchpartyUseCase = new UpdateWatchpartyUseCase(this.repository);
    this.deleteWatchpartyUseCase = new DeleteWatchpartyUseCase(this.repository);

    this.controller = new WatchpartyController(
      this.listWatchpartiesUseCase,
      this.getWatchpartyUseCase,
      this.createWatchpartyUseCase,
      this.updateWatchpartyUseCase,
      this.deleteWatchpartyUseCase
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getRepository(): IWatchpartyRepository {
    return this.repository;
  }

  public getController(): WatchpartyController {
    return this.controller;
  }
}

export const watchpartyModule = new WatchpartyModule();
