import { NotFoundError } from "../../../../shared/errors/not-found-error";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator";
import {
  Delete,
  Get,
  Patch,
  Post,
} from "../../../../shared/infrastructure/decorators/rest/route.decorators";
import {
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/rest/validation.decorators";
import {
  commonErrorResponses,
  notFoundErrorResponseSchema,
  unauthorizedErrorResponseSchema,
} from "../../../../shared/schemas/base/error.schemas";
import {
  createSuccessResponseSchema,
  emptySuccessResponseSchema,
} from "../../../../shared/schemas/base/response.schemas";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import {
  type CreateWatchpartyBody,
  createWatchpartyBodyValidator,
} from "../dto/request/create-watchparty.body.validator";
import {
  type DeleteWatchpartyParams,
  deleteWatchpartyParamsValidator,
} from "../dto/request/delete-watchparty.params.validator";
import {
  type GetWatchpartyParams,
  getWatchpartyParamsValidator,
} from "../dto/request/get-watchparty.params.validator";
import {
  type QueryWatchpartiesRequest,
  queryWatchpartiesValidator,
} from "../dto/request/query-watchparties.query.validator";
import {
  type UpdateWatchpartyBody,
  updateWatchpartyBodyValidator,
} from "../dto/request/update-watchparty.body.validator";
import {
  type CreateWatchpartyResponse,
  createWatchpartyResponseValidator,
} from "../dto/response/create-watchparty.response.validator";
import {
  type GetWatchpartyResponse,
  getWatchpartyResponseValidator,
} from "../dto/response/get-watchparty.response.validator";
import {
  type QueryWatchpartiesResponse,
  queryWatchpartiesResponseValidator,
} from "../dto/response/query-watchparties.response.validator";
import {
  type UpdateWatchpartyResponse,
  updateWatchpartyResponseValidator,
} from "../dto/response/update-watchparty.response.validator";
import type { CreateWatchpartyUseCase } from "../use-cases/create-watchparty.use-case";
import type { DeleteWatchpartyUseCase } from "../use-cases/delete-watchparty.use-case";
import type { GetWatchpartyUseCase } from "../use-cases/get-watchparty.use-case";
import type { ListWatchpartiesUseCase } from "../use-cases/list-watchparties.use-case";
import type { UpdateWatchpartyUseCase } from "../use-cases/update-watchparty.use-case";

@Controller({
  tag: "Watchparty",
  prefix: "/watchparty",
  description: "Watchparty management.",
})
export class WatchpartyController extends BaseController {
  constructor(
    private readonly listWatchpartiesUseCase: ListWatchpartiesUseCase,
    private readonly getWatchpartyUseCase: GetWatchpartyUseCase,
    private readonly createWatchpartyUseCase: CreateWatchpartyUseCase,
    private readonly updateWatchpartyUseCase: UpdateWatchpartyUseCase,
    private readonly deleteWatchpartyUseCase: DeleteWatchpartyUseCase
  ) {
    super();
  }

  @Get({
    path: "/",
    description: "Query watchparties with pagination",
    summary: "List watchparties",
  })
  @Protected()
  @ValidateQuery(queryWatchpartiesValidator)
  @ApiResponse(
    200,
    "Watchparties retrieved successfully",
    queryWatchpartiesResponseValidator
  )
  queryWatchparties = asyncHandler(
    async (req, res): Promise<QueryWatchpartiesResponse> => {
      const query = req.query as QueryWatchpartiesRequest;

      if (!req.user?.userId) {
        throw new UnauthorizedError("User not found");
      }

      const response = await this.listWatchpartiesUseCase.execute(query);

      res.status(200).json(response);

      return response;
    }
  );

  @Get({
    path: "/:id",
    description: "Get watchparty by id",
  })
  @Protected()
  @ValidateParams(getWatchpartyParamsValidator)
  @ApiResponse(404, "Watchparty not found", notFoundErrorResponseSchema)
  @ApiResponse(
    401,
    "You should be logged in to execute this action",
    unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    200,
    "Watchparty retrieved successfully",
    createSuccessResponseSchema(getWatchpartyResponseValidator)
  )
  getWatchpartyById = asyncHandler(
    async (req, res): Promise<GetWatchpartyResponse> => {
      const { id } = req.params as GetWatchpartyParams;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError(
          "You should be logged in to execute this action"
        );
      }

      const watchparty = await this.getWatchpartyUseCase.execute(id);

      if (!watchparty) {
        throw new NotFoundError(`Watchparty ${id} not found`);
      }

      res.status(200).json({
        success: true,
        message: "Watchparty retrieved successfully",
        data: watchparty,
      });

      return watchparty;
    }
  );

  @Post({
    path: "/",
    description: "Create a new watchparty",
  })
  @Protected()
  @ValidateBody(createWatchpartyBodyValidator)
  @ApiResponse(400, "Bad request", commonErrorResponses["400"])
  @ApiResponse(401, "User not connected", commonErrorResponses["401"])
  @ApiResponse(404, "Content not found", commonErrorResponses["404"])
  @ApiResponse(
    201,
    "Watchparty created successfully",
    createSuccessResponseSchema(createWatchpartyResponseValidator)
  )
  createWatchparty = asyncHandler(
    async (req, res): Promise<CreateWatchpartyResponse> => {
      const body = req.body as CreateWatchpartyBody;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User not connected");
      }

      const watchparty = await this.createWatchpartyUseCase.execute(
        userId,
        body
      );

      res.status(201).json({
        success: true,
        message: "Watchparty created successfully",
        data: watchparty,
      });

      return watchparty;
    }
  );

  @Patch({
    path: "/:id",
    description: "Update watchparty by id",
  })
  @Protected()
  @ValidateBody(updateWatchpartyBodyValidator)
  @ValidateParams(getWatchpartyParamsValidator)
  @ApiResponse(404, "Watchparty not found", notFoundErrorResponseSchema)
  @ApiResponse(
    401,
    "You should be logged in to execute this action",
    unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    401,
    "You are not authorized to update this watchparty",
    unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    200,
    "Watchparty updated successfully",
    createSuccessResponseSchema(updateWatchpartyResponseValidator)
  )
  updateWatchparty = asyncHandler(
    async (req, res): Promise<UpdateWatchpartyResponse> => {
      const { id } = req.params as GetWatchpartyParams;
      const body = req.body as UpdateWatchpartyBody;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError(
          "You should be logged in to execute this action"
        );
      }

      const watchparty = await this.updateWatchpartyUseCase.execute(
        userId,
        id,
        body
      );

      res.status(200).json({
        success: true,
        message: "Watchparty updated successfully",
        data: watchparty,
      });

      return watchparty;
    }
  );

  @Delete({
    path: "/:id",
    description: "Delete watchparty by id",
  })
  @Protected()
  @ValidateParams(deleteWatchpartyParamsValidator)
  @ApiResponse(404, "Watchparty not found", notFoundErrorResponseSchema)
  @ApiResponse(
    401,
    "You should be logged in to execute this action",
    unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    401,
    "You are not authorized to delete this watchparty",
    unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    200,
    "Watchparty deleted successfully",
    emptySuccessResponseSchema
  )
  deleteWatchparty = asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params as DeleteWatchpartyParams;
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError(
        "You should be logged in to execute this action"
      );
    }

    await this.deleteWatchpartyUseCase.execute(userId, id);

    res.status(200).json({
      success: true,
      message: `Watchparty ${id} deleted successfully`,
    });
  });
}
