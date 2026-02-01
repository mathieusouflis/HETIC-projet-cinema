import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Get } from "../../../../shared/infrastructure/decorators/route.decorators.js";
import {
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { notFoundErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import {
  type GetMovieByIdValidatorParams,
  getMovieByIdValidatorParams,
} from "../dto/requests/get-movie-by-id-params.validator.js";
import {
  type QueryMovieRequest,
  queryMovieRequestSchema,
} from "../dto/requests/query-movies.validator.js";
import {
  type GetMovieByIdResponse,
  getMovieByIdResponseSchema,
} from "../dto/response/get-movie-by-id-response.validator.js";
import {
  type QueryMovieResponse,
  queryMovieResponseSchema,
} from "../dto/response/query-movie.validator.js";
import type { GetMovieByIdUseCase } from "../use-cases/get-movie-by-id.use-case.js";
import type { QueryMovieUseCase } from "../use-cases/query-movie.use-case.js";

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
    description: "List movies with pagination",
    summary: "Query movies",
  })
  @ValidateQuery(queryMovieRequestSchema)
  @ApiResponse(200, "Movies retrieved successfully", queryMovieResponseSchema)
  queryMovies = asyncHandler(async (req, res): Promise<QueryMovieResponse> => {
    const query = req.query as QueryMovieRequest;

    const response = await this.queryMoviesUseCase.execute(query);

    res.status(200).json(response);

    return response;
  });

  @Get({
    path: "/:id",
    description: "Get movie by id",
  })
  @ValidateParams(getMovieByIdValidatorParams)
  @ApiResponse(404, "Movie not found", notFoundErrorResponseSchema)
  @ApiResponse(200, "Movie retrieved successfully", getMovieByIdResponseSchema)
  getMovieById = asyncHandler(
    async (req, res): Promise<GetMovieByIdResponse> => {
      const { id } = req.params as GetMovieByIdValidatorParams;

      const movie = await this.getMovieByIdUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: "Movie retrieved successfully",
        data: movie,
      });

      return movie;
    }
  );
}
