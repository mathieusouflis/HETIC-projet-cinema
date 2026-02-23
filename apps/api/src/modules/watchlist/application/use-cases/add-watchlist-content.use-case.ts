import {
  ConflictError,
  NotFoundError,
  ServerError,
} from "../../../../shared/errors";
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
    const content = await this.contentRepository.getContentById({
      id: body.contentId,
    });
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
        throw new ServerError("Failed to create watchlist entry");
      }

      return createdWatchlistContent;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof ServerError
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("unique") ||
        errorMessage.includes("duplicate") ||
        errorMessage.includes("already exists")
      ) {
        throw new ConflictError(
          `Content ${body.contentId} already exists in watchlist`
        );
      }

      throw new ServerError(
        `Failed to add content to watchlist: ${errorMessage}`
      );
    }
  }
}
