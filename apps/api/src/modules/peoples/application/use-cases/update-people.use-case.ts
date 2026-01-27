import { NotFoundError } from "../../../../shared/errors";
import type {
  People,
  UpdatePeopleProps,
} from "../../domain/entities/people.entity";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";

export class UpdatePeopleUseCase {
  constructor(private readonly peoplesRepository: IPeoplesRepository) {}

  async execute(id: string, props: UpdatePeopleProps): Promise<People> {
    // Check if person exists
    const existingPeople = await this.peoplesRepository.getById(id);

    if (!existingPeople) {
      throw new NotFoundError(`Person with id ${id} not found`);
    }

    // Update the person
    const updatedPeople = await this.peoplesRepository.update(id, props);
    return updatedPeople;
  }
}
