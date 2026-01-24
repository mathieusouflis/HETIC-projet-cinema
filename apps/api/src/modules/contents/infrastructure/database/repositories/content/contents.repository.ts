import { eq } from "drizzle-orm";
import { db } from "../../../../../../database";
import { content } from "../../../../../../database/schema";
import { PaginationQuery } from "../../../../../../shared/schemas/base/pagination.schema";
import { MoviesRepository } from "../../../../../movies/infrastructure/database/repositories/movie.repository";
import { SerieRepository } from "../../../../../series/infrastructure/database/repositories/serie.repository";
import { Content } from "../../../../domain/entities/content.entity";
import { IContentRepository } from "../../../../domain/interfaces/IContentRepository";
import { logger } from "@packages/logger";

export class ContentsRepository implements IContentRepository {

  private moviesRepository: MoviesRepository;
  private seriesRepository: SerieRepository;

  constructor() {
    this.moviesRepository = new MoviesRepository()
    this.seriesRepository = new SerieRepository()
  }

  async getContentById(id: string): Promise<Content | undefined> {
    logger.info(`Getting content by id: ${id}`)
    const [row] = await db.select().from(content).where(eq(content.id, id)).limit(1);

    if (row) {
      return new Content(row);
    }

    return undefined;
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
