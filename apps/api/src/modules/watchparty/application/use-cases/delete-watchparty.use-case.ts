import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import type { IWatchpartyRepository } from "../../domain/interfaces/IWatchpartyRepository.js";

export class DeleteWatchpartyUseCase {
  private repository: IWatchpartyRepository;

  constructor(repository: IWatchpartyRepository) {
    this.repository = repository;
  }

  async execute(userId: string, id: string): Promise<void> {
    const watchparty = await this.repository.findById(id);

    if (!watchparty) {
      throw new NotFoundError(`Watchparty ${id} not found`);
    }

    if (!watchparty.isCreator(userId)) {
      throw new UnauthorizedError(
        "You are not authorized to delete this watchparty"
      );
    }

    await this.repository.delete(id);
  }
}
