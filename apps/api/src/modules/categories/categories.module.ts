import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/RestModule.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import { CategoriesController } from "./application/controllers/categories.controller.js";
// import { CreateCategoryUseCase } from "./application/use-cases/category/create-category.use-case.js";
// import { DeleteCategoryUseCase } from "./application/use-cases/category/delete-category.use-case.js";
import { GetCategoryByIdUseCase } from "./application/use-cases/category/get-category-by-id.use-case.js";
import { ListCategoriesUseCase } from "./application/use-cases/category/list-categories.use-case.js";
// import { UpdateCategoryUseCase } from "./application/use-cases/category/update-category.use-case.js";
import { CategoryRepository } from "./infrastructure/database/repositories/category/category.repository.js";

class CategoriesModule extends RestModule {
  // ============================================
  // Infrastructure Layer (Data Access)
  // ============================================

  private readonly categoryRepository: CategoryRepository;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  // private readonly createCategoryUseCase: CreateCategoryUseCase;
  private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase;
  private readonly listCategoriesUseCase: ListCategoriesUseCase;
  // private readonly updateCategoryUseCase: UpdateCategoryUseCase;
  // private readonly deleteCategoryUseCase: DeleteCategoryUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: CategoriesController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "Categories Module",
      description: "Module for managing content categories",
    });

    this.categoryRepository = new CategoryRepository();

    // this.createCategoryUseCase = new CreateCategoryUseCase(
    //   this.categoryRepository
    // );
    this.getCategoryByIdUseCase = new GetCategoryByIdUseCase(
      this.categoryRepository
    );
    this.listCategoriesUseCase = new ListCategoriesUseCase(
      this.categoryRepository
    );
    // this.updateCategoryUseCase = new UpdateCategoryUseCase(
    //   this.categoryRepository
    // );
    // this.deleteCategoryUseCase = new DeleteCategoryUseCase(
    //   this.categoryRepository
    // );

    this.controller = new CategoriesController(
      // this.createCategoryUseCase,
      this.getCategoryByIdUseCase,
      this.listCategoriesUseCase
      // this.updateCategoryUseCase,
      // this.deleteCategoryUseCase
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getCategoryRepository(): CategoryRepository {
    return this.categoryRepository;
  }

  public getController(): CategoriesController {
    return this.controller;
  }
}

export const categoriesModule = new CategoriesModule();
