import { paginationService } from "../../../../shared/services/pagination.service.js";
import { createPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository.js";

export type SearchPeopleParams = {
  query: string;
  page?: number;
  limit?: number;
};

export class SearchPeopleUseCase {
  constructor(private readonly peoplesRepository: IPeoplesRepository) {}

  async execute(params: SearchPeopleParams) {
    const { query } = params;

    if (!query || query.trim().length === 0) {
      const emptyResult = paginationService.createPageResult([], 1, 25, 0);
      return createPaginatedResponseFromResult(emptyResult);
    }

    const { page, limit } = paginationService.parsePageParams({
      page: params.page,
      limit: params.limit,
    });

    const peoples = await this.peoplesRepository.searchPeople(query, page);

    const total = peoples.length;

    const peopleResponses = peoples.map((people) => people.toJSON());

    const paginatedResult = paginationService.createPageResult(
      peopleResponses,
      page,
      limit,
      total
    );

    return createPaginatedResponseFromResult(paginatedResult);
  }
}
