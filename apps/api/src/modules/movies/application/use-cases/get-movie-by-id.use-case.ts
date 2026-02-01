import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import type { IMoviesRepository } from "../../domain/interfaces/IMoviesRepository.js";
import type { GetMovieByIdResponse } from "../dto/response/get-movie-by-id-response.validator.js";

export class GetMovieByIdUseCase {
  constructor(private readonly movieRepository: IMoviesRepository) {}

  async execute(
    id: string,
    options: { withCategories?: boolean }
  ): Promise<GetMovieByIdResponse> {
    const movie = await this.movieRepository.getMovieById(id, options);

    if (!movie) {
      throw new NotFoundError(`Movie with id ${id}`);
    }

    return movie.toJSON();
  }
}
