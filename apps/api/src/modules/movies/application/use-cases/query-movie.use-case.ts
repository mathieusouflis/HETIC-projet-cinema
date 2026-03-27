import { paginationService } from "../../../../shared/services/pagination/pagination.service";
import { buildPaginatedResponseFromResult } from "../../../../shared/utils/response.utils";
import type { IMoviesRepository } from "../../domain/interfaces/IMoviesRepository";
import type { QueryMovieRequest } from "../dto/requests/query-movies.validator";
import type { QueryMovieResponse } from "../dto/response/query-movie.validator";

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
