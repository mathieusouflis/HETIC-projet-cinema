import { Content } from "../../../contents/domain/entities/content.entity";

export interface IMoviesRepository {
  getMovieById: (id: string) => Promise<Content | null>;
  listMovies: (type?: string, title?: string) => Promise<Content[]>;
}
