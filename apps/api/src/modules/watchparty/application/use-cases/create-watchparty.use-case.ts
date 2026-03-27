import { NotFoundError } from "../../../../shared/errors/not-found-error";
import type { IContentRepository } from "../../../contents/domain/interfaces/IContentRepository";
import type { Watchparty } from "../../domain/entities/watchparty.entity";
import type { IWatchpartyRepository } from "../../domain/interfaces/IWatchpartyRepository";
import type { CreateWatchpartyBody } from "../dto/request/create-watchparty.body.validator";

export class CreateWatchpartyUseCase {
  constructor(
    private readonly watchpartyRepository: IWatchpartyRepository,
    private readonly contentRepository: IContentRepository
  ) {}

  async execute(
    userId: string,
    body: CreateWatchpartyBody
  ): Promise<Watchparty> {
    const content = await this.contentRepository.getContentById({
      id: body.contentId,
    });
    if (!content) {
      throw new NotFoundError(`Content ${body.contentId} not found`);
    }

    const createdWatchparty = await this.watchpartyRepository.create({
      createdBy: userId,
      contentId: body.contentId,
      seasonId: body.seasonId ?? undefined,
      episodeId: body.episodeId ?? undefined,
      name: body.name,
      description: body.description ?? undefined,
      isPublic: body.isPublic ?? false,
      maxParticipants: body.maxParticipants ?? undefined,
      platformId: body.platformId,
      platformUrl: body.platformUrl,
      scheduledAt: body.scheduledAt.toISOString(),
      status: body.status ?? "scheduled",
      leaderUserId: userId,
    });

    if (!createdWatchparty) {
      throw new NotFoundError("Watchparty not created");
    }

    return createdWatchparty;
  }
}
