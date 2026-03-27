import { NotFoundError } from "../../../../shared/errors/not-found-error";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import type { Watchparty } from "../../domain/entities/watchparty.entity";
import type { IWatchpartyRepository } from "../../domain/interfaces/IWatchpartyRepository";
import type { UpdateWatchpartyBody } from "../dto/request/update-watchparty.body.validator";

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
