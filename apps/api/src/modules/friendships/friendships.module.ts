import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator";
import { UserRepository } from "../users/infrastructure/database/repositories/user.repository";
import { FriendshipsController } from "./application/controllers/friendships.controller";
import { GetMyFriendshipsUseCase } from "./application/use-cases/get-my-friendships.use-case";
import { RemoveFriendshipUseCase } from "./application/use-cases/remove-friendship.use-case";
import { RespondToFriendRequestUseCase } from "./application/use-cases/respond-to-friend-request.use-case";
import { SendFriendRequestUseCase } from "./application/use-cases/send-friend-request.use-case";
import { FriendshipsRepository } from "./infrastructure/repositories/friendships.repository";

class FriendshipsModule extends RestModule {
  private readonly friendshipsRepository: FriendshipsRepository;
  private readonly userRepository: UserRepository;

  private readonly sendFriendRequestUseCase: SendFriendRequestUseCase;
  private readonly respondToFriendRequestUseCase: RespondToFriendRequestUseCase;
  private readonly removeFriendshipUseCase: RemoveFriendshipUseCase;
  private readonly getMyFriendshipsUseCase: GetMyFriendshipsUseCase;

  private readonly controller: FriendshipsController;
  private readonly decoratorRouter: DecoratorRouter;
  private readonly router: Router;

  constructor() {
    super({
      name: "Friendships",
      description: "Friendship management module",
    });

    this.friendshipsRepository = new FriendshipsRepository();
    this.userRepository = new UserRepository();

    this.sendFriendRequestUseCase = new SendFriendRequestUseCase(
      this.userRepository,
      this.friendshipsRepository
    );
    this.respondToFriendRequestUseCase = new RespondToFriendRequestUseCase(
      this.friendshipsRepository
    );
    this.removeFriendshipUseCase = new RemoveFriendshipUseCase(
      this.friendshipsRepository
    );
    this.getMyFriendshipsUseCase = new GetMyFriendshipsUseCase(
      this.friendshipsRepository
    );

    this.controller = new FriendshipsController(
      this.sendFriendRequestUseCase,
      this.respondToFriendRequestUseCase,
      this.removeFriendshipUseCase,
      this.getMyFriendshipsUseCase
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getFriendshipsRepository(): FriendshipsRepository {
    return this.friendshipsRepository;
  }
}

export const friendshipsModule = new FriendshipsModule();
