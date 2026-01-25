import { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";
import { QueryWatchlistRequest } from "../dto/request/query-watchlist.query.validator";
import { QueryWatchlistResponse } from "../dto/response/query-watchlist.response.validator";
export class ListWatchlistUseCase {

  private repository: IWatchlistRepository;

  constructor(repository: IWatchlistRepository) {
    this.repository = repository;
  }

  async execute(userId: string, query: QueryWatchlistRequest): Promise<QueryWatchlistResponse> {
    const { status } = query;

    return await this.repository.list(userId, { status });
  }
}
