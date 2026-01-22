import { PaginationQuery } from "../../../../../../shared/schemas/base/pagination.schema";
import { MovieRepository } from "../../../../../movies/infrastructure/database/repositories/movie.repository";
import { SerieRepository } from "../../../../../series/infrastructure/database/repositories/serie.repository";
import { Content } from "../../../../domain/entities/content.entity";
import { IContentRepository } from "../../../../domain/interfaces/IContentRepository";

export class ContentsRepository implements IContentRepository {

  private moviesRepository: MovieRepository;
  private seriesRepository: SerieRepository;

  constructor() {
    this.moviesRepository = new MovieRepository()
    this.seriesRepository = new SerieRepository()
  }

  async listContents(type?: string, title?: string, country?: string, categories?: string[], options?: PaginationQuery): Promise<Content[]> {
    switch (type) {
      case "movie": {
        return this.moviesRepository.listMovies(title, country, categories, options);
      }
      case "serie": {
        return this.seriesRepository.listSeries(title, country, categories, options);
      }
      default: {
        const [movies, series] = await Promise.all([
          this.moviesRepository.listMovies(title, country, categories, options),
          this.seriesRepository.listSeries(title, country, categories, options),
        ]);
        return [...movies, ...series];
      }
    }
  }

  async searchContents(query: string, type?: string, options?: PaginationQuery): Promise<Content[]> {
    switch (type) {
      case "movie": {
        return this.moviesRepository.searchMovies(query, options);
      }
      case "serie": {
        return this.seriesRepository.searchSeries(query, options);
      }
      default: {
        const [movies, series] = await Promise.all([
          this.moviesRepository.searchMovies(query, options),
          this.seriesRepository.searchSeries(query, options),
        ]);
        return [...movies, ...series];
      }
    }
  }

}
