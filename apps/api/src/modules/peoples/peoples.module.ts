import { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { IPeoplesRepository} from "./domain/interfaces/IPeoplesRepository.js";
import { PeoplesController } from "./application/controllers/peoples.controller.js";
import { PeoplesRepository } from "./infrastructure/repositories/peoples.repository.js";

class PeoplesModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly repository: IPeoplesRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================


  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: PeoplesController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Users Module",
      description: "Module for managing users"
    })


    this.repository = new PeoplesRepository()

    this.controller = new PeoplesController();

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }


  public getMoviesRepository(): IPeoplesRepository {
    return this.repository;
  }


  public getController(): PeoplesController {
    return this.controller;
  }
}

export const peoplesModule = new PeoplesModule();
