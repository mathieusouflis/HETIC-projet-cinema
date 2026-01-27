import type { ISeriesRepository } from "../../domain/interfaces/ISeriesRepository.js";
import type { QuerySerieRequest } from "../dto/requests/query-serie.validator.js";
import type { QuerySerieResponse } from "../dto/response/query-serie.validator.js";

export class QuerySerieUseCase {
  constructor(private readonly serieRepository: ISeriesRepository) {}

  async execute(query: QuerySerieRequest): Promise<QuerySerieResponse> {
    const result = await this.serieRepository.listSeries(
      query.title,
      undefined,
      undefined,
      {
        page: query.page ?? 1,
        limit: query.limit ?? 25,
      }
    );

    const response = result.map((serie) => serie.toJSON());
    return response;
  }
}
