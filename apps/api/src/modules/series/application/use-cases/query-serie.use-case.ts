import { paginationService } from "../../../../shared/services/pagination.service.js";
import { createPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
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

    const series = await this.serieRepository.listSeries(
      query.title,
      undefined,
      undefined,
      {
        page,
        limit,
      }
    );

    const total = series.total;

    const seriesResponses = series.data.map((serie) => serie.toJSON());

    const paginatedResult = paginationService.createPageResult(
      seriesResponses,
      page,
      limit,
      total
    );

    return createPaginatedResponseFromResult(paginatedResult);
  }
}
