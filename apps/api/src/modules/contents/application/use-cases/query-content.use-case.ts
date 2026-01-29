import { paginationService } from "../../../../shared/services/pagination.service.js";
import { createPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import type { IContentRepository } from "../../domain/interfaces/IContentRepository.js";
import type { QueryContentRequest } from "../dto/requests/query-contents.validator.js";
import type { QueryContentResponse } from "../dto/response/query-content.validator.js";

export class QueryContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(query: QueryContentRequest): Promise<QueryContentResponse> {
    const { page, limit } = paginationService.parsePageParams({
      page: query.page,
      limit: query.limit,
    });

    const withCategory = query.withCategory === "true";

    const contents = await this.contentRepository.listContents(
      query.contentType,
      query.title,
      undefined,
      undefined,
      withCategory,
      {
        page,
        limit,
      }
    );

    const total = contents.total;

    const contentFormatted = contents.data.map((content) =>
      content.toJSONWithRelations()
    );

    const paginatedResult = paginationService.createPageResult(
      contentFormatted,
      page,
      limit,
      total
    );

    return createPaginatedResponseFromResult(paginatedResult);
  }
}
