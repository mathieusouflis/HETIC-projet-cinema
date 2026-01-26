import { People } from "../../domain/entities/people.entity";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";

export type ListPeoplesParams = {
  nationality?: string;
  name?: string;
  limit?: number;
  offset?: number;
};

export class ListPeoplesUseCase {
  constructor(private readonly peoplesRepository: IPeoplesRepository) {}

  async execute(params: ListPeoplesParams): Promise<People[]> {
    const peoples = await this.peoplesRepository.list(params);
    return peoples;
  }

  async executeWithCount(params: ListPeoplesParams): Promise<{ peoples: People[]; total: number }> {
    const [peoples, total] = await Promise.all([
      this.peoplesRepository.list(params),
      this.peoplesRepository.getCount({
        nationality: params.nationality,
        name: params.name,
      }),
    ]);

    return { peoples, total };
  }
}
