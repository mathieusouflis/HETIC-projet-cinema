import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Protected } from "../../../../shared/infrastructure/decorators/auth.decorator.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Get } from "../../../../shared/infrastructure/decorators/route.decorators.js";
import { ValidateQuery } from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { createSuccessResponse } from "../../../../shared/schemas/base/response.schemas.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { QueryWatchlistRequest, queryWatchlistValidator } from "../dto/request/query-watchlist.query.validator.js";
import { QueryWatchlistResponse, queryWatchlistResponseValidator } from "../dto/response/query-watchlist.response.validator.js";
import { ListWatchlistUseCase } from "../use-cases/list-watchlist.use-case.js";

@Controller({
  tag: "Watchlist",
  prefix: "/watchlist",
  description: "Watchlist management.",
})

export class WatchlistController extends BaseController {
  constructor(
    private readonly queryWatchlistUseCase: ListWatchlistUseCase,
    // private readonly getWatchlistContentUseCase: GetWatchlistContentUseCase,
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


  // @Get({
  //   path: "/",
  //   description: "List movies by type",
  // })
  // @ValidateQuery(queryMovieRequestSchema)
  // @ApiResponse(200, "Movies retrieved successfully", createSuccessResponse(queryMovieResponseSchema))
  // queryMovies = asyncHandler(async (req, res): Promise<QueryMovieResponse> => {
  //   const query = req.query as QueryMovieRequest;

  //   const movies = await this.queryMoviesUseCase.execute(query);

  //   res.status(200).json({
  //     success: true,
  //     message: "Movies retrieved successfully",
  //     data: movies,
  //   });

  //   return movies;
  // });

  // @Get({
  //   path: "/:id",
  //   description: "Get movie by id",
  // })
  // @ValidateParams(getMovieByIdValidatorParams)
  // @ApiResponse(404, "Movie not found", notFoundErrorResponseSchema)
  // @ApiResponse(200, "Movie retrieved successfully", getMovieByIdResponseSchema)
  // getMovieById = asyncHandler(async (req, res): Promise<GetMovieByIdResponse> => {
  //   logger.info(req.params)
  //   const {id} = req.params as GetMovieByIdValidatorParams;

  //   const movie = await this.getMovieByIdUseCase.execute(id);

  //   res.status(200).json({
  //     success: true,
  //     message: "Movie retrieved successfully",
  //     data: movie,
  //   });

  //   return movie;
  // });

}
