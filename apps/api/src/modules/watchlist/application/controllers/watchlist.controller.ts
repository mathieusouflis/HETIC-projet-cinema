import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Protected } from "../../../../shared/infrastructure/decorators/auth.decorator.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Delete, Get, Patch, Post } from "../../../../shared/infrastructure/decorators/route.decorators.js";
import { ValidateBody, ValidateParams, ValidateQuery } from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { commonErrorResponses, notFoundErrorResponseSchema, unauthorizedErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas.js";
import { createSuccessResponse, emptySuccessResponseSchema } from "../../../../shared/schemas/base/response.schemas.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { QueryWatchlistRequest, queryWatchlistValidator } from "../dto/request/query-watchlist.query.validator.js";
import { GetWatchlistByIdParams, getWatchlistByIdParamsValidator } from "../dto/request/get-watchlist.params.validator.js";
import { QueryWatchlistResponse, queryWatchlistResponseValidator } from "../dto/response/query-watchlist.response.validator.js";
import { ListWatchlistUseCase } from "../use-cases/list-watchlist.use-case.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { GetWatchlistByIdResponse, getWatchlistByIdResponseValidator } from "../dto/response/get-watchlist.response.validator.js";
import { GetWatchlistByContentIdUseCase } from "../use-cases/get-watchlist-content.use-case.js";
import { GetWatchlistByContentIdParams, getWatchlistByContentIdParamsValidator } from "../dto/request/get-watchlist-content-id.params.validator.js";
import { GetWatchlistByContentIdResponse, getWatchlistByContentIdResponseValidator } from "../dto/response/get-watchlist-content.response.validator.js";
import { GetWatchlistByIdUseCase } from "../use-cases/get-watchlist.use-case.js";
import { PatchWatchlistBody, patchWatchlistBodyValidator } from "../dto/request/patch-watchlist.body.validator.js";
import { PatchWatchlistResponse, patchWatchlistResponseValidator } from "../dto/response/patch-watchlist.response.validator.js";
import { PatchWatchlistByIdUseCase } from "../use-cases/patch-watchlist.use-case.js";
import { PatchWatchlistParams, patchWatchlistParamsValidator } from "../dto/request/patch-watchlist.params.validator.js";
import { PatchWatchlistByContentIdParams, patchWatchlistByContentIdParamsValidator } from "../dto/request/patch-watchlist-by-content-id.params.validator.js";
import { PatchWatchlistByContentIdUseCase } from "../use-cases/patch-watchlist-by-content.use-case.js";
import { DeleteWatchlistParams, deleteWatchlistParamsValidator } from "../dto/request/delete-watchlist.params.validator.js";
import { DeleteWatchlistByIdUseCase } from "../use-cases/delete-watchlist.use-case.js";
import { AddContentToWatchlistBody, addContentToWatchlistBodyValidator } from "../dto/request/add-content-to-watchlist.body.validator.js";
import { AddWatchlistContentResponse, addWatchlistContentResponseValidator } from "../dto/response/add-watchlist-content.response.validator.js";
import { AddWatchlistContentUseCase } from "../use-cases/add-watchlist-content.use-case.js";

@Controller({
  tag: "Watchlist",
  prefix: "/watchlist",
  description: "Watchlist management.",
})

export class WatchlistController extends BaseController {
  constructor(
    private readonly queryWatchlistUseCase: ListWatchlistUseCase,
    private readonly addWatchlistContentUseCase: AddWatchlistContentUseCase,
    private readonly getWatchlistByIdUseCase: GetWatchlistByIdUseCase,
    private readonly getWatchlistByContentIdUseCase: GetWatchlistByContentIdUseCase,
    private readonly patchWatchlistByIdUseCase: PatchWatchlistByIdUseCase,
    private readonly patchWatchlistByContentIdUseCase: PatchWatchlistByContentIdUseCase,
    private readonly deleteWatchlistByIdUseCase: DeleteWatchlistByIdUseCase,
  ) {
    super();
  }

  @Get({
    path: "/",
    description: "Query watchlist"
  })
  @Protected()
  @ValidateQuery(queryWatchlistValidator)
  @ApiResponse(200, "Watchlist retrieved successfully", createSuccessResponse(queryWatchlistResponseValidator))
  queryWatchlist = asyncHandler(async (req, res): Promise<QueryWatchlistResponse> => {
    const query = req.query as QueryWatchlistRequest;

    if (!req.user?.userId) {
      throw new UnauthorizedError("User not found");
    }

    const watchlist = await this.queryWatchlistUseCase.execute(req.user.userId, query)

     res.status(200).json({
      success: true,
      message: "Watchlist retrieved successfully",
      data: watchlist
     })

    return watchlist

  })


  @Get({
    path: "/content/:id",
    description: "Get watchlist content by id",
  })
  @Protected()
  @ValidateParams(getWatchlistByContentIdParamsValidator)
  @ApiResponse(404, "Content not found in watchlist", notFoundErrorResponseSchema)
  @ApiResponse(401, "You should be logged in to execute this action", unauthorizedErrorResponseSchema)
  @ApiResponse(200, "Content retrieved successfully", createSuccessResponse(getWatchlistByContentIdResponseValidator))
  getMovieById = asyncHandler(async (req, res): Promise<GetWatchlistByContentIdResponse> => {
    const { id } = req.params as GetWatchlistByContentIdParams;
    const userId = req.user?.userId;

    if(!userId) {
      throw new UnauthorizedError("You should be logged in to execute this action");
    }

    const movie = await this.getWatchlistByContentIdUseCase.execute(userId, id);

    if (!movie) {
      throw new NotFoundError(`Content ${id} not found in watchlist`);
    }

    res.status(200).json({
      success: true,
      message: "Content in watchlist retrieved successfully",
      data: movie,
    });

    return movie;
  });

  @Post({
    path: "/",
    description: "Add content to personal watchlist"
  })
  @Protected()
  @ValidateBody(addContentToWatchlistBodyValidator)
  @ApiResponse(400, "Bad request", commonErrorResponses["400"])
  @ApiResponse(401, "User not connected", commonErrorResponses["401"])
  @ApiResponse(409, "Content already in watchlist", commonErrorResponses["409"])
  @ApiResponse(201, "Content added to watchlist successfully", createSuccessResponse(addWatchlistContentResponseValidator))
  addContentToWatchlist = asyncHandler(async (req, res): Promise<AddWatchlistContentResponse> => {
    const body = req.body as AddContentToWatchlistBody;

    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError("User not connected");
    }

    const movie = await this.addWatchlistContentUseCase.execute(userId, body);

    res.status(201).json({
      success: true,
      message: "Content added to watchlist successfully",
      data: movie
    });

    return movie
  });

  @Get({
    path: "/:id",
    description: "Get watchlist by id",
  })
  @Protected()
  @ValidateParams(getWatchlistByIdParamsValidator)
  @ApiResponse(404, "Watchlist not found", notFoundErrorResponseSchema)
  @ApiResponse(401, "You should be logged in to execute this action", unauthorizedErrorResponseSchema)
  @ApiResponse(401, "You are not authorized to access this watchlist", unauthorizedErrorResponseSchema)
  @ApiResponse(200, "Watchlist retrieved successfully", createSuccessResponse(getWatchlistByIdResponseValidator))
  getWatchlistById = asyncHandler(async (req, res): Promise<GetWatchlistByIdResponse> => {
    const { id } = req.params as GetWatchlistByIdParams;
    const userId = req.user?.userId;

    if(!userId) {
      throw new UnauthorizedError("You should be logged in to execute this action");
    }

    const movie = await this.getWatchlistByIdUseCase.execute(userId, id);

    if (!movie) {
      throw new NotFoundError(`Watchlist ${id} not found`);
    }

    res.status(200).json({
      success: true,
      message: "Watchlist retrieved successfully",
      data: movie,
    });

    return movie;
  });

  @Patch({
    path: "/:id",
    description: "Update watchlist by id",
  })
  @Protected()
  @ValidateBody(patchWatchlistBodyValidator)
  @ValidateParams(patchWatchlistParamsValidator)
  @ApiResponse(404, "Content not found in watchlist", notFoundErrorResponseSchema)
  @ApiResponse(401, "You should be logged in to execute this action", unauthorizedErrorResponseSchema)
  @ApiResponse(401, "You are not authorized to access this watchlist", unauthorizedErrorResponseSchema)
  @ApiResponse(200, "Watchlist updated successfully", createSuccessResponse(patchWatchlistResponseValidator))
  patchWatchlistById = asyncHandler(async (req, res): Promise<PatchWatchlistResponse> => {
    const { id } = req.params as PatchWatchlistParams;
    const body = req.body as PatchWatchlistBody
    const userId = req.user?.userId;

    if(!userId) {
      throw new UnauthorizedError("You should be logged in to execute this action");
    }

    const movie = await this.patchWatchlistByIdUseCase.execute(userId, id, body);

    res.status(200).json({
      success: true,
      message: "Watchlist updated successfully",
      data: movie,
    });

    return movie;
  });


  @Patch({
    path: "/content/:id",
    description: "Update watchlist by content id",
  })
  @Protected()
  @ValidateBody(patchWatchlistBodyValidator)
  @ValidateParams(patchWatchlistByContentIdParamsValidator)
  @ApiResponse(404, "Content not found in watchlist", notFoundErrorResponseSchema)
  @ApiResponse(401, "You should be logged in to execute this action", unauthorizedErrorResponseSchema)
  @ApiResponse(401, "You are not authorized to access this watchlist", unauthorizedErrorResponseSchema)
  @ApiResponse(200, "Watchlist updated successfully", createSuccessResponse(patchWatchlistResponseValidator))
  patchWatchlistByContentId = asyncHandler(async (req, res): Promise<PatchWatchlistResponse> => {
    const { id } = req.params as PatchWatchlistByContentIdParams;
    const body = req.body as PatchWatchlistBody
    const userId = req.user?.userId;

    if(!userId) {
      throw new UnauthorizedError("You should be logged in to execute this action");
    }

    const movie = await this.patchWatchlistByContentIdUseCase.execute(userId, id, body);

    res.status(200).json({
      success: true,
      message: "Watchlist updated successfully",
      data: movie,
    });

    return movie;
  });

  @Delete({
    path: "/:id",
    description: "Delete watchlist by id",
  })
  @Protected()
  @ValidateParams(deleteWatchlistParamsValidator)
  @ApiResponse(404, "Content not found in watchlist", notFoundErrorResponseSchema)
  @ApiResponse(401, "You should be logged in to execute this action", unauthorizedErrorResponseSchema)
  @ApiResponse(401, "You are not authorized to access this watchlist", unauthorizedErrorResponseSchema)
  @ApiResponse(204, "Watchlist deleted successfully", emptySuccessResponseSchema)
  deleteWatchlistById = asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params as DeleteWatchlistParams;
    const userId = req.user?.userId;

    if(!userId) {
      throw new UnauthorizedError("You should be logged in to execute this action");
    }

    await this.deleteWatchlistByIdUseCase.execute(userId, id);

    res.status(200).json({
      success: true,
      message: `Watchlist ${id} deleted successfully`,
    });

  });
}
