import { NotFoundError } from "../../../../shared/errors";
import type { IPeoplesRepository } from "../../domain/interfaces/IPeoplesRepository";

export class DeletePeopleUseCase {
  constructor(private readonly peoplesRepository: IPeoplesRepository) {}

  async execute(id: string): Promise<void> {
    // Check if person exists
    const existingPeople = await this.peoplesRepository.getById(id);

    if (!existingPeople) {
      throw new NotFoundError(`Person with id ${id} not found`);
    }

    // Delete the person
    await this.peoplesRepository.delete(id);
  }
}
