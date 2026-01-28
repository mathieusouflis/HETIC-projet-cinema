import { paginationService } from "../../../../shared/services/pagination.service.js";
import { createPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import type { IContentRepository } from "../../domain/interfaces/IContentRepository.js";
import type { SearchContentsRequest } from "../dto/requests/search-contents.validator.js";
import type { SearchContentsResponse } from "../dto/response/search-contents.validator.js";

export class SearchContentsUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(
    params: SearchContentsRequest
  ): Promise<SearchContentsResponse> {
    const { query, type } = params;

    if (!query || query.trim().length === 0) {
      const emptyResult = paginationService.createPageResult([], 1, 25, 0);
      return createPaginatedResponseFromResult(emptyResult);
    }

    const { page, limit } = paginationService.parsePageParams({
      page: params.page,
      limit: params.limit,
    });

    const contents = await this.contentRepository.searchContents(query, type, {
      page,
      limit,
    });

    const total = contents.length;

    const contentResponses = contents.map((content) => content.toJSON());

    const paginatedResult = paginationService.createPageResult(
      contentResponses,
      page,
      limit,
      total
    );

    return createPaginatedResponseFromResult(paginatedResult);
  }
}
