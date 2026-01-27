import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { UsersController } from "./application/controllers/users.controller.js";
import { DeleteUserUseCase } from "./application/use-cases/DeleteUser.usecase.js";
import { GetMeUseCase } from "./application/use-cases/GetMe.usecase.js";
import { GetUserByIdUseCase } from "./application/use-cases/GetUserById.usecase.js";
import { GetUsersUseCase } from "./application/use-cases/GetUsers.usecase.js";
import { UpdateUserUseCase } from "./application/use-cases/UpdateUser.usecase.js";
import { UserRepository } from "./infrastructure/database/repositories/user.repository.js";

class UsersModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly userRepository: UserRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly getUserByIdUseCase: GetUserByIdUseCase;

  private readonly getUsersUseCase: GetUsersUseCase;

  private readonly getMeUseCase: GetMeUseCase;

  private readonly updateUserUseCase: UpdateUserUseCase;

  private readonly deleteUserUseCase: DeleteUserUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: UsersController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Users Module",
      description: "Module for managing users",
    });
    this.userRepository = new UserRepository();

    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getMeUseCase = new GetMeUseCase(this.userRepository);
    this.getUsersUseCase = new GetUsersUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);

    this.controller = new UsersController(
      this.getUserByIdUseCase,
      this.getUsersUseCase,
      this.updateUserUseCase,
      this.deleteUserUseCase,
      this.getMeUseCase
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getUserRepository(): UserRepository {
    return this.userRepository;
  }

  public getController(): UsersController {
    return this.controller;
  }
}

export const usersModule = new UsersModule();
