import { paginationService } from "../../../../shared/services/pagination/index.js";
import { createOffsetPaginatedResult } from "../../../../shared/utils/pagination.utils.js";
import { buildOffsetPaginatedResponseFromResult } from "../../../../shared/utils/response.utils.js";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository.js";

export type ListPeoplesParams = {
  nationality?: string;
  name?: string;
  limit?: number;
  offset?: number;
};

export class ListPeoplesUseCase {
  constructor(private readonly peoplesRepository: IPeoplesRepository) {}

  async execute(params: ListPeoplesParams) {
    const { offset, limit } = paginationService.parseOffsetParams({
      offset: params.offset,
      limit: params.limit,
    });

    const peoples = await this.peoplesRepository.list({
      nationality: params.nationality,
      name: params.name,
      offset,
      limit,
    });

    const peopleResponses = peoples.data.map((people) => people.toJSON());

    const paginatedResult = createOffsetPaginatedResult(
      peopleResponses,
      offset,
      limit,
      peoples.total
    );

    return buildOffsetPaginatedResponseFromResult(paginatedResult);
  }
}
