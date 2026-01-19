import { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { ContentsController } from "./application/controllers/contents.controller.js";

class UsersModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  // private readonly userRepository: UserRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  // private readonly getUserByIdUseCase: GetUserByIdUseCase;

  // private readonly getUsersUseCase: GetUsersUseCase;

  // private readonly getMeUseCase: GetMeUseCase;

  // private readonly updateUserUseCase: UpdateUserUseCase;

  // private readonly deleteUserUseCase: DeleteUserUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: ContentsController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Users Module",
      description: "Module for managing users"
    })

    this.controller = new ContentsController(
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  // public getUserRepository(): UserRepository {
  //   return this.userRepository;
  // }

  public getController(): ContentsController {
    return this.controller;
  }
}

export const usersModule = new UsersModule();
