import { Router } from "express";
import { DecoratorRouter } from "../../shared/infrastructure/decorators";
import { WatchlistsController } from "./application/controllers/watchlists.controller";
import { RestModule } from "@/shared/infrastructure/base/modules";

class WatchlistsModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================


  // ============================================
  // Application Layer (Use Cases)
  // ============================================


  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================
  private readonly controller: WatchlistsController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;


  constructor() {
    super({
      name: "Watchlist Module",
      description: "Module for managing personal watchlist"
    })

    this.controller = new WatchlistsController()

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  // public getUserRepository(): UserRepository {
  //   return this.userRepository;
  // }

  public getController(): WatchlistsController {
    return this.controller;
  }
}

export const usersModule = new WatchlistsModule();
