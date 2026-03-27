import { paginationService } from "../../../../shared/services/pagination/pagination.service";
import { buildPaginatedResponseFromResult } from "../../../../shared/utils/response.utils";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";
import type { QueryWatchlistRequest } from "../dto/request/query-watchlist.query.validator";
import type { QueryWatchlistResponse } from "../dto/response/query-watchlist.response.validator";

export class ListWatchlistUseCase {
  private repository: IWatchlistRepository;

  constructor(repository: IWatchlistRepository) {
    this.repository = repository;
  }

  async execute(
    userId: string,
    query: QueryWatchlistRequest
  ): Promise<QueryWatchlistResponse> {
    const { page, limit } = paginationService.parsePageParams({
      page: query.page,
      limit: query.limit ?? 10000000,
    });

    const { status } = query;

    const watchlistItems = await this.repository.list(userId, { status });

    const total = watchlistItems.total;

    const paginatedResult = paginationService.createPageResult(
      watchlistItems.data,
      page,
      limit,
      total
    );

    return buildPaginatedResponseFromResult(paginatedResult);
  }
}
