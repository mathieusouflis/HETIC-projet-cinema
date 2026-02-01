import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import { Shared } from "../../../../shared/index.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { Protected } from "../../../../shared/infrastructure/decorators/index.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import {
  Delete,
  Get,
  Patch,
  Post,
} from "../../../../shared/infrastructure/decorators/route.decorators.js";
import {
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { createPaginatedResult } from "../../../../shared/utils/pagination.utils.js";
import { buildPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import {
  type CategoryIdParamsDTO,
  categoryIdParamsSchema,
} from "../dto/requests/category-id.validator.js";
import {
  // type CreateCategoryDTO,
  createCategoryBodySchema,
} from "../dto/requests/create-category.validator.js";
import {
  type ListCategoriesQueryDTO,
  listCategoriesQuerySchema,
} from "../dto/requests/list-categories.validator.js";
import {
  // type UpdateCategoryDTO,
  updateCategoryBodySchema,
  updateCategoryParamsSchema,
} from "../dto/requests/update-category.validator.js";
import {
  type CategoriesListResponseDTO,
  type CategoryResponseDTO,
  categoriesListResponseSchema,
  categoryResponseSchema,
} from "../dto/response/category.response.js";
// import type { CreateCategoryUseCase } from "../use-cases/category/create-category.use-case.js";
// import type { DeleteCategoryUseCase } from "../use-cases/category/delete-category.use-case.js";
import type { GetCategoryByIdUseCase } from "../use-cases/category/get-category-by-id.use-case.js";
import type { ListCategoriesUseCase } from "../use-cases/category/list-categories.use-case.js";
// import type { UpdateCategoryUseCase } from "../use-cases/category/update-category.use-case.js";

@Controller({
  tag: "Categories",
  prefix: "/categories",
  description: "Category management endpoints",
})
export class CategoriesController extends BaseController {
  constructor(
    // private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase
    // private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    // private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) {
    super();
  }

  @Post({
    path: "/",
    summary: "Create category",
    description: "Create a new category",
  })
  @Protected()
  @ValidateBody(createCategoryBodySchema)
  @ApiResponse(
    201,
    "Category created successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(categoryResponseSchema)
  )
  @ApiResponse(
    400,
    "Invalid input data",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    409,
    "Category with this name or slug already exists",
    Shared.Schemas.Base.conflictErrorResponseSchema
  )
  createCategory = asyncHandler((_req: Request, _res: Response) => {
    throw new UnauthorizedError("Route not implementes");
    // const data = req.body as CreateCategoryDTO;

    // const category = await this.createCategoryUseCase.execute(data);

    // res.status(201).json({
    //   success: true,
    //   data: category.toJSON(),
    // });

    // return category.toJSON();
  });

  @Get({
    path: "/:id",
    summary: "Get category by ID",
    description: "Retrieve a category by its unique identifier",
  })
  @ValidateParams(categoryIdParamsSchema)
  @ApiResponse(
    200,
    "Category retrieved successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(categoryResponseSchema)
  )
  @ApiResponse(
    400,
    "Invalid category ID",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    404,
    "Category not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  getCategoryById = asyncHandler(
    async (req: Request, res: Response): Promise<CategoryResponseDTO> => {
      const { id } = req.params as CategoryIdParamsDTO;

      const category = await this.getCategoryByIdUseCase.execute(id);

      res.status(200).json({
        success: true,
        data: category.toJSON(),
      });

      return category.toJSON();
    }
  );

  @Get({
    path: "/",
    summary: "List all categories",
    description: "Retrieve a paginated list of all categories",
  })
  @ValidateQuery(listCategoriesQuerySchema)
  @ApiResponse(
    200,
    "Categories retrieved successfully",
    categoriesListResponseSchema
  )
  @ApiResponse(
    400,
    "Invalid pagination parameters",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  listCategories = asyncHandler(
    async (req: Request, res: Response): Promise<CategoriesListResponseDTO> => {
      const { page = 1, limit = 10 } = req.query as ListCategoriesQueryDTO;

      const result = await this.listCategoriesUseCase.execute({
        page,
        limit,
      });

      const response = buildPaginatedResponseFromResult(
        createPaginatedResult(
          result.categories.map((cat) => cat.toJSONWithRelations()),
          result.total,
          result.page,
          result.limit
        )
      );

      res.status(200).json(response);

      return response;
    }
  );

  @Patch({
    path: "/:id",
    summary: "Update category",
    description: "Update an existing category",
  })
  @Protected()
  @ValidateParams(updateCategoryParamsSchema)
  @ValidateBody(updateCategoryBodySchema)
  @ApiResponse(
    200,
    "Category updated successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(categoryResponseSchema)
  )
  @ApiResponse(
    400,
    "Invalid input data",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    404,
    "Category not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  @ApiResponse(
    409,
    "Category with this name or slug already exists",
    Shared.Schemas.Base.conflictErrorResponseSchema
  )
  updateCategory = asyncHandler((_req: Request, _res: Response) => {
    throw new UnauthorizedError("Access denied");
    // const { id } = req.params as CategoryIdParamsDTO;
    // const data = req.body as UpdateCategoryDTO;
    // const category = await this.updateCategoryUseCase.execute(id, data);
    // res.status(200).json({
    //   success: true,
    //   data: category.toJSON(),
    // });
    // return category.toJSON();
  });

  @Delete({
    path: "/:id",
    summary: "Delete category",
    description: "Delete a category by its ID",
  })
  @Protected()
  @ValidateParams(categoryIdParamsSchema)
  @ApiResponse(204, "Category deleted successfully")
  @ApiResponse(
    400,
    "Invalid category ID",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    404,
    "Category not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  deleteCategory = asyncHandler(
    (_req: Request, _res: Response): Promise<void> => {
      throw new UnauthorizedError("Access denied");
      // const { id } = req.params as CategoryIdParamsDTO;

      // await this.deleteCategoryUseCase.execute(id);

      // res.status(204).send();
    }
  );
}
