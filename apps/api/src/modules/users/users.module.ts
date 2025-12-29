import { Router } from "express";
import { GetUserByIdUseCase } from "./application/use-cases/GetUserById.usecase.js";
import { GetUsersUseCase } from "./application/use-cases/GetUsers.usecase.js";
import { UpdateUserUseCase } from "./application/use-cases/UpdateUser.usecase.js";
import { DeleteUserUseCase } from "./application/use-cases/DeleteUser.usecase.js";
import { UsersController } from "./application/controllers/users.controller.js";
import { createUsersRouter } from "./presentation/routes/users.routes.js";
import { UserRepository } from "./infrastructure/database/repositories/user.repository.js";

class UsersModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly userRepository: UserRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly getUserByIdUseCase: GetUserByIdUseCase;

  private readonly getUsersUseCase: GetUsersUseCase;

  private readonly updateUserUseCase: UpdateUserUseCase;

  private readonly deleteUserUseCase: DeleteUserUseCase;

  // ============================================
  // Presentation Layer (Controller)
  // ============================================

  private readonly controller: UsersController;

  private readonly router: Router;

  constructor() {
    this.userRepository = new UserRepository();

    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getUsersUseCase = new GetUsersUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);

    this.controller = new UsersController(
      this.getUserByIdUseCase,
      this.getUsersUseCase,
      this.updateUserUseCase,
      this.deleteUserUseCase,
    );

    this.router = createUsersRouter(this.controller);
  }

  /**
   * Get the configured Express router for this module
   *
   * @returns Express Router with all user routes
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get the user repository instance
   *
   * @returns UserRepository instance
   */
  public getUserRepository(): UserRepository {
    return this.userRepository;
  }
}

export const usersModule = new UsersModule();
