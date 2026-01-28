import { paginationService } from "../../../../shared/services/pagination.service.js";
import { createPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
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

    const movies = await this.movieRepository.listMovies(
      query.title,
      undefined,
      undefined,
      {
        page,
        limit,
      }
    );

    const total = movies.total;

    const movieDTOs = movies.data.map((movie) => movie.toJSON());

    const paginatedResult = paginationService.createPageResult(
      movieDTOs,
      page,
      limit,
      total
    );

    return createPaginatedResponseFromResult(paginatedResult);
  }
}
