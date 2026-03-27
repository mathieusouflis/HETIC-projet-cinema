import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator";
import { Get } from "../../../../shared/infrastructure/decorators/rest/route.decorators";
import {
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/rest/validation.decorators";
import { notFoundErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import {
  type GetMovieByIdValidatorParams,
  getMovieByIdValidatorParams,
} from "../dto/requests/get-movie-by-id-params.validator";
import {
  type GetMovieByIdValidatorQuery,
  getMovieByIdValidatorQuery,
} from "../dto/requests/get-movie-by-id-query.validator";
import {
  type QueryMovieRequest,
  queryMovieRequestSchema,
} from "../dto/requests/query-movies.validator";
import {
  type GetMovieByIdResponse,
  getMovieByIdResponseSchema,
} from "../dto/response/get-movie-by-id-response.validator";
import {
  type QueryMovieResponse,
  queryMovieResponseSchema,
} from "../dto/response/query-movie.validator";
import type { GetMovieByIdUseCase } from "../use-cases/get-movie-by-id.use-case";
import type { QueryMovieUseCase } from "../use-cases/query-movie.use-case";

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
  @ValidateQuery(getMovieByIdValidatorQuery)
  @ApiResponse(404, "Movie not found", notFoundErrorResponseSchema)
  @ApiResponse(200, "Movie retrieved successfully", getMovieByIdResponseSchema)
  getMovieById = asyncHandler(
    async (req, res): Promise<GetMovieByIdResponse> => {
      const { id } = req.params as GetMovieByIdValidatorParams;
      const { ...options } = req.query as GetMovieByIdValidatorQuery;

      const movie = await this.getMovieByIdUseCase.execute(id, {
        withCategories: options.withCategories === "true",
      });

      res.status(200).json({
        success: true,
        message: "Movie retrieved successfully",
        data: movie,
      });

      return movie;
    }
  );
}
