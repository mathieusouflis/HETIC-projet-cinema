import { paginationService } from "../../../../shared/services/pagination/pagination.service";
import { buildPaginatedResponseFromResult } from "../../../../shared/utils/response.utils";
import type { IContentRepository } from "../../domain/interfaces/IContentRepository";
import type { QueryContentRequest } from "../dto/requests/query-contents.validator";
import type { QueryContentResponse } from "../dto/response/query-content.validator";

export class QueryContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(query: QueryContentRequest): Promise<QueryContentResponse> {
    const { page, limit } = paginationService.parsePageParams({
      page: query.page,
      limit: query.limit,
    });

    const withCategory = query.withCategory === "true";
    const withPlatform = query.withPlatform === "true";
    const withCast = query.withCast === "true";
    const withSeasons = query.withSeasons === "true";
    const withEpisodes = query.withEpisodes === "true";

    const contents = await this.contentRepository.listContents(
      query.contentType,
      query.title,
      undefined,
      query.categories,
      withCategory,
      withPlatform,
      withCast,
      withSeasons,
      withEpisodes,
      {
        page,
        limit,
      }
    );

    const total = contents.total;

    const contentFormatted = contents.data.map((content) => {
      return content.toJSONWithRelations();
    });

    const paginatedResult = paginationService.createPageResult(
      contentFormatted,
      page,
      limit,
      total
    );

    return buildPaginatedResponseFromResult(paginatedResult);
  }
}
