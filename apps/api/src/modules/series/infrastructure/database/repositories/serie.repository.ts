import { TMDBSeriesAdapter } from "../../../../series/infrastructure/database/repositories/serie.tmdb.adapter";
import { CreateSerieProps, Serie } from "../../../domain/entities/serie.entity";
import { ISeriesRepository } from "../../../domain/interfaces/ISeriesRepository";
import { DrizzleSerieAdapter } from "./serie.drizzle.adapter";

export class SerieRepository implements ISeriesRepository {

  private tmdbAdapter: TMDBSeriesAdapter;
  private drizzleAdapter: DrizzleSerieAdapter;

  constructor() {
    this.tmdbAdapter = new TMDBSeriesAdapter()
    this.drizzleAdapter = new DrizzleSerieAdapter()
  }

  async createSerie(content: CreateSerieProps): Promise<Serie> {
    const createdContent = await this.drizzleAdapter.createSerie(content)
    return createdContent;
  }

  async getSerieById(_id: string): Promise<Serie | null> {
    return null;
  }

  async processSeries(tmdbSeries: CreateSerieProps[]): Promise<Serie[]> {
    const tmdbSerieIds = tmdbSeries.map((serie) => serie.tmdbId).filter((id) => id !== null && id !== undefined);

    const tmdbSeriesWithStatus = await this.drizzleAdapter.checkSerieExistsInDb(tmdbSerieIds);
    const seriesToCreate = tmdbSeries.filter((serie) => serie.tmdbId && !tmdbSeriesWithStatus[serie.tmdbId]);

    return await Promise.all(seriesToCreate.map((serie) => this.drizzleAdapter.createSerie(serie)));
  }

  async listSeries(_title?: string): Promise<Serie[]> {
    const tmdbSeries = await this.tmdbAdapter.listSeries();
    const seriesCreated = await this.processSeries(tmdbSeries);
    const seriesListed = await this.listSeries()

    return [...seriesCreated, ...seriesListed];

  }
}
