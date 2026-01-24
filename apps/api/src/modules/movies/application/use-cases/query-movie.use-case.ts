import { IMoviesRepository } from "../../domain/interfaces/IMoviesRepository.js";
import { QueryMovieRequest } from "../dto/requests/query-movies.validator.js";
import { QueryMovieResponse } from "../dto/response/query-movie.validator.js";

export class QueryMovieUseCase {
  constructor(private readonly movieRepository: IMoviesRepository) {}

  async execute(query: QueryMovieRequest): Promise<QueryMovieResponse> {
    const result = await this.movieRepository.listMovies(query.title, undefined, undefined, {
      page: query.page ?? 1,
      limit: query.limit ?? 25,
    });

    const response = result.map((movie) => movie.toJSON());
    return response;
  }
}
