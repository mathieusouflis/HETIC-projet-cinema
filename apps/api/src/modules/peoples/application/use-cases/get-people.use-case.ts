import { NotFoundError } from "../../../../shared/errors";
import { People } from "../../domain/entities/people.entity";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";

export class GetPeopleUseCase {
  constructor(private readonly peoplesRepository: IPeoplesRepository) {}

  async execute(id: string): Promise<People> {
    const people = await this.peoplesRepository.getById(id);

    if (!people) {
      throw new NotFoundError(`Person with id ${id} not found`);
    }

    return people;
  }
}
