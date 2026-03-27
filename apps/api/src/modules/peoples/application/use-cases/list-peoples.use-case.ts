import { paginationService } from "../../../../shared/services/pagination/pagination.service";
import { buildOffsetPaginatedResponseFromResult } from "../../../../shared/utils/response.utils";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";

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

    const paginatedResult = paginationService.createOffsetResult(
      peopleResponses,
      offset,
      limit,
      peoples.total
    );

    return buildOffsetPaginatedResponseFromResult(paginatedResult);
  }
}
