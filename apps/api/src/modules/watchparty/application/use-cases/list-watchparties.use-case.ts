import { paginationService } from "../../../../shared/services/pagination/index.js";
import { buildPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import type { IWatchpartyRepository } from "../../domain/interfaces/IWatchpartyRepository.js";
import type { QueryWatchpartiesRequest } from "../dto/request/query-watchparties.query.validator.js";
import type { QueryWatchpartiesResponse } from "../dto/response/query-watchparties.response.validator.js";

export class ListWatchpartiesUseCase {
  private repository: IWatchpartyRepository;

  constructor(repository: IWatchpartyRepository) {
    this.repository = repository;
  }

  async execute(
    query: QueryWatchpartiesRequest
  ): Promise<QueryWatchpartiesResponse> {
    const { page, limit } = paginationService.parsePageParams({
      page: query.page,
      limit: query.limit,
    });

    const { status, isPublic, contentId } = query;

    const watchparties = await this.repository.list({
      status,
      isPublic,
      contentId,
    });
    const paginatedResult = paginationService.createPageResult(
      watchparties.data,
      page,
      limit,
      watchparties.total
    );

    return buildPaginatedResponseFromResult(paginatedResult);
  }
}
