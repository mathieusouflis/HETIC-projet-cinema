import { IContentRepository } from "../../domain/interfaces/IContentRepository.js";
import { QueryContentRequest } from "../dto/requests/query-contents.validator";
import { QueryContentResponse } from "../dto/response/query-content.validator.js";

export class QueryContentUseCase {
  constructor(private readonly contentRepository: IContentRepository) {}

  async execute(_query: QueryContentRequest): Promise<QueryContentResponse> {
    const result = await this.contentRepository.listContents();
    const response = result.map((content) => content.toJSON());
    return response;
  }
}
