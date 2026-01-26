import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Protected } from "../../../../shared/infrastructure/decorators/auth.decorator.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Get, Post } from "../../../../shared/infrastructure/decorators/route.decorators.js";
import { ValidateBody, ValidateParams, ValidateQuery } from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { commonErrorResponses, notFoundErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas.js";
import { createSuccessResponse } from "../../../../shared/schemas/base/response.schemas.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { QueryWatchlistRequest, queryWatchlistValidator } from "../dto/request/query-watchlist.query.validator.js";
import { GetWatchlistByIdParams, getWatchlistByIdParamsValidator } from "../dto/request/get-watchlist.params.validator.js";
import { QueryWatchlistResponse, queryWatchlistResponseValidator } from "../dto/response/query-watchlist.response.validator.js";
import { ListWatchlistUseCase } from "../use-cases/list-watchlist.use-case.js";
import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { GetWatchlistByIdResponse, getWatchlistByIdResponseValidator } from "../dto/response/get-watchlist.response.validator.js";
import { GetWatchlistContentUseCase } from "../use-cases/get-watchlist-content.use-case.js";
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
    private readonly getWatchlistContentUseCase: GetWatchlistContentUseCase,
    private readonly addWatchlistContentUseCase: AddWatchlistContentUseCase,
    // private readonly updateWatchlistContentUseCase: UpdateWatchlistContentUseCase,
    // private readonly deleteWatchlistContentUseCase: DeleteWatchlistContentUseCase
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
    path: "/:id",
    description: "Get watchlist content by id",
  })
  @ValidateParams(getWatchlistByIdParamsValidator)
  @ApiResponse(404, "Content not found in watchlist", notFoundErrorResponseSchema)
  @ApiResponse(200, "Content retrieved successfully", getWatchlistByIdResponseValidator)
  getMovieById = asyncHandler(async (req, res): Promise<GetWatchlistByIdResponse> => {
    const {id} = req.params as GetWatchlistByIdParams;

    const movie = await this.getWatchlistContentUseCase.execute(id);

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

}
