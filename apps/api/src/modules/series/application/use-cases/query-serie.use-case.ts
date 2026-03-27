import { paginationService } from "../../../../shared/services/pagination/pagination.service";
import { buildPaginatedResponseFromResult } from "../../../../shared/utils/response.utils";
import type { ISeriesRepository } from "../../domain/interfaces/ISeriesRepository";
import type { QuerySerieRequest } from "../dto/requests/query-serie.validator";
import type { QuerySerieResponse } from "../dto/response/query-serie.validator";

export class QuerySerieUseCase {
  constructor(private readonly serieRepository: ISeriesRepository) {}

  async execute(query: QuerySerieRequest): Promise<QuerySerieResponse> {
    const { page, limit } = paginationService.parsePageParams({
      page: query.page,
      limit: query.limit,
    });

    const withCategories = query.withCategories === "true";
    const withPlatforms = query.withPlatforms === "true";
    const withCast = query.withCast === "true";
    const withSeasons = query.withSeasons === "true";
    const withEpisodes = query.withEpisodes === "true";

    const series = await this.serieRepository.listSeries(
      query.title,
      undefined,
      undefined,
      withCategories,
      withPlatforms,
      withCast,
      withSeasons,
      withEpisodes,
      {
        page,
        limit,
      }
    );

    const total = series.total;

    const seriesResponses = series.data.map((serie) =>
      serie.toJSONWithRelations()
    );

    const paginatedResult = paginationService.createPageResult(
      seriesResponses,
      page,
      limit,
      total
    );

    return buildPaginatedResponseFromResult(paginatedResult);
  }
}
