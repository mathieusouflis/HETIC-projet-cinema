import { ConflictError, NotFoundError } from "../../../../shared/errors";
import type { IContentRepository } from "../../../contents/domain/interfaces/IContentRepository";
import type { Watchlist } from "../../domain/entities/watchlist.entity";
import type { IWatchlistRepository } from "../../domain/interfaces/IWatchlistRepository";
import type { AddContentToWatchlistBody } from "../dto/request/add-content-to-watchlist.body.validator";

export class AddWatchlistContentUseCase {
  constructor(
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly contentRepository: IContentRepository
  ) {}

  async execute(
    userId: string,
    body: AddContentToWatchlistBody
  ): Promise<Watchlist> {
    const content = await this.contentRepository.getContentById(body.contentId);
    if (!content) {
      throw new NotFoundError(`Content ${body.contentId} not found`);
    }

    try {
      const createdWatchlistContent = await this.watchlistRepository.create({
        userId,
        ...body,
        startedAt: body.startedAt ? body.startedAt.toISOString() : undefined,
        completedAt: body.completedAt
          ? body.completedAt.toISOString()
          : undefined,
      });

      if (!createdWatchlistContent) {
        throw new NotFoundError("Watchlist not found");
      }

      return createdWatchlistContent;
    } catch (error) {
      throw new ConflictError(
        `Content ${body.contentId} already exists in watchlist: ${error}`
      );
    }
  }
}
