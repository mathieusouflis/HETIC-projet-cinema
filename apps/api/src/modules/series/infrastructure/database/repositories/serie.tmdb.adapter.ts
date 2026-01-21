import { logger } from "@packages/logger";
import { TmdbService } from "../../../../../shared/services/tmdb";
import { TMDBFetchStatusRepository } from "../../../../contents/infrastructure/database/repositories/tmdb-fetch-status/tmdb-fetch-status.repository";
import { CreateSerieProps } from "../../../domain/entities/serie.entity";
import { MetadataNotFoundError } from "../../../../contents/infrastructure/database/repositories/tmdb-fetch-status/errors/metadata-not-found";


type TMDBSerie = {
  backdrop_path: string,
  first_air_date: string,
  genre_ids: number[],
  id: number,
  name: string,
  origin_country: string[],
  original_language: string,
  original_name: string,
  overview: string,
  popularity: number,
  poster_path: string,
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

type DiscoverSerieResult = {
  page: number,
  results: Array<TMDBSerie>
}
type GetSerieById = {
  page: number,
  results: TMDBSerie
}

export class TMDBSeriesAdapter  {
  private tmdbService: TmdbService;
  private tmdbFetchStatusRepository: TMDBFetchStatusRepository;


  constructor() {
    this.tmdbService = new TmdbService();
    this.tmdbFetchStatusRepository = new TMDBFetchStatusRepository();
  }

  async parseResultToSerie(result: TMDBSerie): Promise<CreateSerieProps> {
    return {
      slug: result.id.toString(),
      title: result.name ?? null,
      type: "serie",
      backdropUrl: result.backdrop_path,
      posterUrl: result.poster_path,
      tmdbId: result.id,
      originalTitle: result.original_name ?? null,
      releaseDate: result.first_air_date ?? null,
      trailerUrl: await this.getSerieTrailerUrl(result.id) ?? null
    }
  }
  async getContentById(id: string): Promise<CreateSerieProps | null> {
    const result = await this.tmdbService.request("GET", `tv/${id}`) as GetSerieById;
    return await this.parseResultToSerie(result.results);
  }

  async getSerieTrailerUrl(serieId: number): Promise<string | null> {
    const result = await this.tmdbService.request("GET", `tv/${serieId}/videos`) as GetTrailersResult
    const trailer = result.results.find(video => video.type === "Trailer");
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  }

  private async fetchAndParseSeries(PATH: string, page: number): Promise<CreateSerieProps[]> {
    const result = await this.tmdbService.request("GET", PATH, { page: page.toString() }) as DiscoverSerieResult;
    const series = await Promise.all(result.results.map(async content => await this.parseResultToSerie(content)));
    await this.tmdbFetchStatusRepository.setPathMetadatas(PATH, { page: page });
    return series;
  }

  async listSeries(page: number = 1): Promise<CreateSerieProps[]> {
    const PATH = "discover/tv";
    try {
      const metadata = await this.tmdbFetchStatusRepository.getPathMetadatas(PATH);

      if (metadata.page < page) {
        const series = await this.fetchAndParseSeries(PATH, page);
        return series;
      }

    } catch (error) {
      if (error instanceof MetadataNotFoundError) {
        const series = await this.fetchAndParseSeries(PATH, page);
        return series;

      }

      logger.error(`Error fetching series: ${error}`);
    }

    return [];
  }

}
