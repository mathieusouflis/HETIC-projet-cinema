import { TMDBMoviesAdapter } from "../../../../movies/infrastructure/database/repositories/movie.tmdb.adapter";
import { CreateMovieProps, Movie } from "../../../domain/entities/movie.entity";
import { IMoviesRepository } from "../../../domain/interfaces/IMoviesRepository";
import { DrizzleMovieAdapter } from "./movie.drizzle.adapter";

export class MovieRepository implements IMoviesRepository {

  private tmdbAdapter: TMDBMoviesAdapter;
  private drizzleAdapter: DrizzleMovieAdapter;

  constructor() {
    this.tmdbAdapter = new TMDBMoviesAdapter()
    this.drizzleAdapter = new DrizzleMovieAdapter()
  }

  async createMovie(content: CreateMovieProps): Promise<Movie> {
    const createdContent = await this.drizzleAdapter.createMovie(content)
    return createdContent;
  }

  async getMovieById(_id: string): Promise<Movie | null> {
    return null;
  }

  async processMovies(tmdbMovies: CreateMovieProps[]): Promise<Movie[]> {
    const tmdbMovieIds = tmdbMovies.map((movie) => movie.tmdbId).filter((id) => id !== null && id !== undefined);

    const tmdbMoviesWithStatus = await this.drizzleAdapter.checkMovieExistsInDb(tmdbMovieIds);
    const moviesToCreate = tmdbMovies.filter((movie) => movie.tmdbId && !tmdbMoviesWithStatus[movie.tmdbId]);

    return await Promise.all(moviesToCreate.map((movie) => this.drizzleAdapter.createMovie(movie)));
  }

  async listMovies(_title?: string): Promise<Movie[]> {
    const tmdbMovies = await this.tmdbAdapter.listMovies();
    const moviesCreated = await this.processMovies(tmdbMovies);
    const moviesListed = await this.listMovies()

    return [...moviesCreated, ...moviesListed];

  }

}
