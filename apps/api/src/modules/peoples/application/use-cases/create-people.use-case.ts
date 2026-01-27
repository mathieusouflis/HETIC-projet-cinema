import type {
  CreatePeopleProps,
  People,
} from "../../domain/entities/people.entity";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";

export class CreatePeopleUseCase {
  constructor(private readonly peoplesRepository: IPeoplesRepository) {}

  async execute(props: CreatePeopleProps): Promise<People> {
    const people = await this.peoplesRepository.create(props);
    return people;
  }
}
