import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { Watchparty } from "../../domain/entities/watchparty.entity.js";
import { IWatchpartyRepository } from "../../domain/interfaces/IWatchpartyRepository.js";

export class GetWatchpartyUseCase {

  private repository: IWatchpartyRepository;

  constructor(repository: IWatchpartyRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<Watchparty> {
    const watchparty = await this.repository.findById(id);

    if (!watchparty) {
      throw new NotFoundError(`Watchparty ${id} not found`);
    }

    return watchparty;
  }
}
