import { NotFoundError } from "../../../../shared/errors/NotFoundError.js";
import { IContentRepository } from "../../../contents/domain/interfaces/IContentRepository.js";
import { Watchparty } from "../../domain/entities/watchparty.entity.js";
import { IWatchpartyRepository } from "../../domain/interfaces/IWatchpartyRepository.js";
import { CreateWatchpartyBody } from "../dto/request/create-watchparty.body.validator.js";

export class CreateWatchpartyUseCase {

  constructor(
    private readonly watchpartyRepository: IWatchpartyRepository,
    private readonly contentRepository: IContentRepository
  ) { }

  async execute(userId: string, body: CreateWatchpartyBody): Promise<Watchparty> {
    const content = await this.contentRepository.getContentById(body.contentId);
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
