import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import type { Watchparty } from "../../domain/entities/watchparty.entity.js";
import type { IWatchpartyRepository } from "../../domain/interfaces/IWatchpartyRepository.js";
import type { UpdateWatchpartyBody } from "../dto/request/update-watchparty.body.validator.js";

export class UpdateWatchpartyUseCase {
  private repository: IWatchpartyRepository;

  constructor(repository: IWatchpartyRepository) {
    this.repository = repository;
  }

  async execute(
    userId: string,
    id: string,
    body: UpdateWatchpartyBody
  ): Promise<Watchparty> {
    const watchparty = await this.repository.findById(id);

    if (!watchparty) {
      throw new NotFoundError(`Watchparty ${id} not found`);
    }

    if (!watchparty.isCreator(userId) && !watchparty.isLeader(userId)) {
      throw new UnauthorizedError(
        "You are not authorized to update this watchparty"
      );
    }

    const updatedWatchparty = await this.repository.update(id, {
      name: body.name,
      description: body.description,
      isPublic: body.isPublic,
      maxParticipants: body.maxParticipants,
      platformId: body.platformId,
      platformUrl: body.platformUrl,
      scheduledAt: body.scheduledAt
        ? body.scheduledAt.toISOString()
        : undefined,
      startedAt: body.startedAt ? body.startedAt.toISOString() : undefined,
      endedAt: body.endedAt ? body.endedAt.toISOString() : undefined,
      status: body.status,
      currentPositionTimestamp: body.currentPositionTimestamp,
      isPlaying: body.isPlaying,
      leaderUserId: body.leaderUserId,
    });

    return updatedWatchparty;
  }
}
