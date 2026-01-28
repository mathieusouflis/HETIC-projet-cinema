import type { People } from "../../domain/entities/people.entity";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";

export type SearchPeopleParams = {
  query: string;
  page?: number;
};

export class SearchPeopleUseCase {
  constructor(private readonly peoplesRepository: IPeoplesRepository) {}

  async execute(params: SearchPeopleParams): Promise<People[]> {
    const { query, page = 1 } = params;

    if (!query || query.trim().length === 0) {
      return [];
    }

    const peoples = await this.peoplesRepository.searchPeople(query, page);
    return peoples;
  }
}
