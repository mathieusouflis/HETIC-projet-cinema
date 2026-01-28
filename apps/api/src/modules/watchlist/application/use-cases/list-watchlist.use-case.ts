import { paginationService } from "../../../../shared/services/pagination.service.js";
import { createPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository.js";
import type { QueryWatchlistRequest } from "../dto/request/query-watchlist.query.validator.js";
import type { QueryWatchlistResponse } from "../dto/response/query-watchlist.response.validator.js";

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
      limit: query.limit,
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

    return createPaginatedResponseFromResult(paginatedResult);
  }
}
