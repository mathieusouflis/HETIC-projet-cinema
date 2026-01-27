import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import type { IContentRepository } from "../contents/domain/interfaces/IContentRepository.js";
import { ContentsRepository } from "../contents/infrastructure/database/repositories/content/contents.repository.js";
import { WatchpartyController } from "./application/controllers/watchparty.controller.js";
import { CreateWatchpartyUseCase } from "./application/use-cases/create-watchparty.use-case.js";
import { DeleteWatchpartyUseCase } from "./application/use-cases/delete-watchparty.use-case.js";
import { GetWatchpartyUseCase } from "./application/use-cases/get-watchparty.use-case.js";
import { ListWatchpartiesUseCase } from "./application/use-cases/list-watchparties.use-case.js";
import { UpdateWatchpartyUseCase } from "./application/use-cases/update-watchparty.use-case.js";
import type { IWatchpartyRepository } from "./domain/interfaces/IWatchpartyRepository.js";
import { WatchpartyRepository } from "./infrastructure/repositories/watchparty.repository.js";

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
