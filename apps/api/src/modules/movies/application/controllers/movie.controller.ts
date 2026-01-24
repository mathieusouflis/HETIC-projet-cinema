import { logger } from "@packages/logger";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Get } from "../../../../shared/infrastructure/decorators/route.decorators.js";
import { ValidateParams, ValidateQuery } from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { notFoundErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas.js";
import { createSuccessResponse } from "../../../../shared/schemas/base/response.schemas.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { GetMovieByIdValidatorParams, getMovieByIdValidatorParams } from "../dto/requests/get-movie-by-id-params.validator.js";
import { QueryMovieRequest, queryMovieRequestSchema } from "../dto/requests/query-movies.validator.js";
import { GetMovieByIdResponse, getMovieByIdResponseSchema } from "../dto/response/get-movie-by-id-response.validator.js";
import { QueryMovieResponse, queryMovieResponseSchema } from "../dto/response/query-movie.validator.js";
import { GetMovieByIdUseCase } from "../use-cases/get-movie-by-id.use-case.js";
import { QueryMovieUseCase } from "../use-cases/query-movie.use-case.js";

@Controller({
  tag: "Movies",
  prefix: "/movies",
  description: "Movies management.",
})
export class MoviesController extends BaseController {
  constructor(
    private readonly queryMoviesUseCase: QueryMovieUseCase,
    private readonly getMovieByIdUseCase: GetMovieByIdUseCase
  ) {
    super();
  }

  @Get({
    path: "/",
    description: "List movies by type",
  })
  @ValidateQuery(queryMovieRequestSchema)
  @ApiResponse(200, "Movies retrieved successfully", createSuccessResponse(queryMovieResponseSchema))
  queryMovies = asyncHandler(async (req, res): Promise<QueryMovieResponse> => {
    const query = req.query as QueryMovieRequest;

    const movies = await this.queryMoviesUseCase.execute(query);

    res.status(200).json({
      success: true,
      message: "Movies retrieved successfully",
      data: movies,
    });

    return movies;
  });

  @Get({
    path: "/:id",
    description: "Get movie by id",
  })
  @ValidateParams(getMovieByIdValidatorParams)
  @ApiResponse(404, "Movie not found", notFoundErrorResponseSchema)
  @ApiResponse(200, "Movie retrieved successfully", getMovieByIdResponseSchema)
  getMovieById = asyncHandler(async (req, res): Promise<GetMovieByIdResponse> => {
    logger.info(req.params)
    const {id} = req.params as GetMovieByIdValidatorParams;

    const movie = await this.getMovieByIdUseCase.execute(id);

    res.status(200).json({
      success: true,
      message: "Movie retrieved successfully",
      data: movie,
    });

    return movie;
  });

}
