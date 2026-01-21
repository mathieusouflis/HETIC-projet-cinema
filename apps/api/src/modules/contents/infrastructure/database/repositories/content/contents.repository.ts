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

  async listContents(type?: string, _title?: string): Promise<Content[]> {
    switch (type) {
      case "movie": {
        return this.moviesRepository.listMovies();
      }
      case "serie": {
        return this.seriesRepository.listSeries();
      }
      default: {
        const [movies, series] = await Promise.all([
          this.moviesRepository.listMovies(),
          this.seriesRepository.listSeries(),
        ]);
        return [...movies, ...series];
      }
    }
  }

}
