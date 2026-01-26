import { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { IPeoplesRepository } from "./domain/interfaces/IPeoplesRepository.js";
import { PeoplesController } from "./application/controllers/peoples.controller.js";
import { PeoplesRepository } from "./infrastructure/repositories/peoples.repository.js";

// Use cases
import { ListPeoplesUseCase } from "./application/use-cases/list-peoples.use-case.js";
import { SearchPeopleUseCase } from "./application/use-cases/search-people.use-case.js";
import { GetPeopleUseCase } from "./application/use-cases/get-people.use-case.js";
import { CreatePeopleUseCase } from "./application/use-cases/create-people.use-case.js";
import { UpdatePeopleUseCase } from "./application/use-cases/update-people.use-case.js";
import { DeletePeopleUseCase } from "./application/use-cases/delete-people.use-case.js";

class PeoplesModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly repository: IPeoplesRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly listPeoplesUseCase: ListPeoplesUseCase;
  private readonly searchPeopleUseCase: SearchPeopleUseCase;
  private readonly getPeopleUseCase: GetPeopleUseCase;
  private readonly createPeopleUseCase: CreatePeopleUseCase;
  private readonly updatePeopleUseCase: UpdatePeopleUseCase;
  private readonly deletePeopleUseCase: DeletePeopleUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: PeoplesController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Peoples Module",
      description: "Module for managing people (actors, directors, etc.)",
    });

    // Initialize repository
    this.repository = new PeoplesRepository();

    // Initialize use cases
    this.listPeoplesUseCase = new ListPeoplesUseCase(this.repository);
    this.searchPeopleUseCase = new SearchPeopleUseCase(this.repository);
    this.getPeopleUseCase = new GetPeopleUseCase(this.repository);
    this.createPeopleUseCase = new CreatePeopleUseCase(this.repository);
    this.updatePeopleUseCase = new UpdatePeopleUseCase(this.repository);
    this.deletePeopleUseCase = new DeletePeopleUseCase(this.repository);

    // Initialize controller with all use cases
    this.controller = new PeoplesController(
      this.listPeoplesUseCase,
      this.searchPeopleUseCase,
      this.getPeopleUseCase,
      this.createPeopleUseCase,
      this.updatePeopleUseCase,
      this.deletePeopleUseCase
    );

    // Generate router from controller
    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getPeoplesRepository(): IPeoplesRepository {
    return this.repository;
  }

  public getController(): PeoplesController {
    return this.controller;
  }
}

export const peoplesModule = new PeoplesModule();
