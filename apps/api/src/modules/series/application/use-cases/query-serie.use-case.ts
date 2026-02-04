import { paginationService } from "../../../../shared/services/pagination/index.js";
import { buildPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import type { ISeriesRepository } from "../../domain/interfaces/ISeriesRepository.js";
import type { QuerySerieRequest } from "../dto/requests/query-serie.validator.js";
import type { QuerySerieResponse } from "../dto/response/query-serie.validator.js";

export class QuerySerieUseCase {
  constructor(private readonly serieRepository: ISeriesRepository) {}

  async execute(query: QuerySerieRequest): Promise<QuerySerieResponse> {
    const { page, limit } = paginationService.parsePageParams({
      page: query.page,
      limit: query.limit,
    });

    const withCategories = query.withCategories === "true";
    const withPlatforms = query.withPlatforms === "true";

    const series = await this.serieRepository.listSeries(
      query.title,
      undefined,
      undefined,
      withCategories,
      withPlatforms,
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
