import { logger } from "@packages/logger";
import { TmdbService } from "../../../../../shared/services/tmdb";
import { TMDBFetchStatusRepository } from "../../../../contents/infrastructure/database/repositories/tmdb-fetch-status/tmdb-fetch-status.repository";
import { CreateMovieProps } from "../../../domain/entities/movie.entity";
import { MetadataNotFoundError } from "../../../../contents/infrastructure/database/repositories/tmdb-fetch-status/errors/metadata-not-found";


type TMDBMovie = {
  adult: boolean,
  backdrop_path: string,
  genre_ids: number[],
  id: number,
  original_language: string,
  original_title: string,
  overview: string,
  popularity: number,
  poster_path: string,
  release_date: string,
  title: string,
  video: boolean,
  vote_average: number,
  vote_count: number
}

type Video = {
    iso_639_1: string,
    iso_3166_1: string,
    name: string,
    key: string,
    site: string | "Youtube",
    size: string,
    type: 'Featurette' | "Trailer" | "Teaser",
    official: boolean,
    published_at: string,
    id: string
  }

type GetTrailersResult = {
    id: number,
    results: Array<Video>
}

type DiscoverMovieResult = {
  page: number,
  results: Array<TMDBMovie>
}
type GetMovieById = {
  page: number,
  results: TMDBMovie
}

export class TMDBMoviesAdapter  {
  private tmdbService: TmdbService;
  private tmdbFetchStatusRepository: TMDBFetchStatusRepository

  constructor() {
    this.tmdbService = new TmdbService();
    this.tmdbFetchStatusRepository = new TMDBFetchStatusRepository();
  }

  async parseResultToMovie(result: TMDBMovie): Promise<CreateMovieProps> {
    return {
      slug: result.id.toString(),
      title: result.title,
      type: "movie",
      backdropUrl: result.backdrop_path,
      posterUrl: result.poster_path,
      tmdbId: result.id,
      originalTitle: result.original_title,
      releaseDate: result.release_date,
      trailerUrl: result.video ? await this.getMovieTrailerUrl(result.id) : null
    }
  }
  async getContentById(id: string): Promise<CreateMovieProps | null> {
    const result = await this.tmdbService.request("GET", `movie/${id}`) as GetMovieById;
    return await this.parseResultToMovie(result.results);
  }

  async getMovieTrailerUrl(movieId: number): Promise<string | null> {
    const result = await this.tmdbService.request("GET", `movie/${movieId}/videos`) as GetTrailersResult
    const trailer = result.results.find(video => video.type === "Trailer");
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  }

  private async fetchAndParseMovies(PATH: string, page: number): Promise<CreateMovieProps[]> {
    const result = await this.tmdbService.request("GET", PATH, { page: page.toString() }) as DiscoverMovieResult;
    const movies = await Promise.all(result.results.map(async content => await this.parseResultToMovie(content)));
    await this.tmdbFetchStatusRepository.setPathMetadatas(PATH, { page: page });
    return movies;
  }

  async listMovies(page: number = 1): Promise<CreateMovieProps[]> {
    const PATH = "discover/movie";
    try {
      const metadata = await this.tmdbFetchStatusRepository.getPathMetadatas(PATH);

      if (metadata.page < page) {
        const movies = await this.fetchAndParseMovies(PATH, page);
        return movies;
      }

    } catch (error) {
      if (error instanceof MetadataNotFoundError) {
        const movies = await this.fetchAndParseMovies(PATH, page);
        return movies;
      }

      logger.error(`Error fetching movies: ${error}`);
    }

    return [];
  }

}
