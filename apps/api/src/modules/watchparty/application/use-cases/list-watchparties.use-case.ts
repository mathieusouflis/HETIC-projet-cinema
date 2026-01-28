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
    const { status, isPublic, contentId } = query;

    return await this.repository.list({ status, isPublic, contentId });
  }
}
