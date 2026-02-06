import { paginationService } from "../../../../shared/services/pagination/index.js";
import { buildPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import type { IMoviesRepository } from "../../domain/interfaces/IMoviesRepository.js";
import type { QueryMovieRequest } from "../dto/requests/query-movies.validator.js";
import type { QueryMovieResponse } from "../dto/response/query-movie.validator.js";

export class QueryMovieUseCase {
  constructor(private readonly movieRepository: IMoviesRepository) {}

  async execute(query: QueryMovieRequest): Promise<QueryMovieResponse> {
    const { page, limit } = paginationService.parsePageParams({
      page: query.page,
      limit: query.limit,
    });

    const withCategories = query.withCategories === "true";
    const withPlatforms = query.withPlatforms === "true";
    const withCast = query.withCast === "true";

    const movies = await this.movieRepository.listMovies(
      query.title,
      undefined,
      undefined,
      withCategories,
      withPlatforms,
      withCast,
      {
        page,
        limit,
      }
    );

    const total = movies.total;

    const movieDTOs = movies.data.map((movie) => movie.toJSONWithRelations());

    const paginatedResult = paginationService.createPageResult(
      movieDTOs,
      page,
      limit,
      total
    );

    return buildPaginatedResponseFromResult(paginatedResult);
  }
}
