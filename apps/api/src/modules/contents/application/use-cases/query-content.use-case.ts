import type { IContentRepository } from "../../domain/interfaces/IContentRepository.js";
import type { QueryContentRequest } from "../dto/requests/query-contents.validator";
import type { QueryContentResponse } from "../dto/response/query-content.validator.js";

export class QueryContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(query: QueryContentRequest): Promise<QueryContentResponse> {
    const result = await this.contentRepository.listContents(
      query.contentType,
      query.title,
      undefined,
      undefined,
      {
        page: query.page ?? 1,
        limit: query.limit ?? 25,
      }
    );

    const response = result.map((content) => content.toJSON());
    return response;
  }
}
