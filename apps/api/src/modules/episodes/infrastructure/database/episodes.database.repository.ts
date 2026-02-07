import { eq } from "drizzle-orm";
import { db } from "../../../../database";
import { ServerError } from "../../../../shared/errors/server-error";
import { Episode } from "../../domain/episode.entity";
import type { IEpisodesRepository } from "../../domain/interfaces/IEpisodesRepository";
import { episodesSchema, type NewEpisodeRow } from "./episodes.schema";

export class EpisodesDatabaseRepository implements IEpisodesRepository {
  async getEpisodeById(id: string): Promise<Episode | null> {
    try {
      const result = await db.query.episodes.findFirst({
        where: eq(episodesSchema.id, id),
      });

      if (!result) {
        return null;
      }

      return new Episode(result);
    } catch (error) {
      throw new ServerError(
        `Failed to get episode by id ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async getEpisodesBySeasonId(seasonId: string): Promise<Episode[]> {
    try {
      const result = await db.query.episodes.findMany({
        where: eq(episodesSchema.seasonId, seasonId),
        orderBy: (episodes, { asc }) => [asc(episodes.episodeNumber)],
      });

      return result.map((row) => new Episode(row));
    } catch (error) {
      throw new ServerError(
        `Failed to get episodes for season ${seasonId}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async getEpisodeByNumber(
    seasonId: string,
    episodeNumber: number
  ): Promise<Episode | null> {
    try {
      const result = await db.query.episodes.findFirst({
        where: (episodes, { and, eq }) =>
          and(
            eq(episodes.seasonId, seasonId),
            eq(episodes.episodeNumber, episodeNumber)
          ),
      });

      if (!result) {
        return null;
      }

      return new Episode(result);
    } catch (error) {
      throw new ServerError(
        `Failed to get episode ${episodeNumber} for season ${seasonId}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async createEpisode(props: NewEpisodeRow): Promise<Episode> {
    try {
      const result = await db.insert(episodesSchema).values(props).returning();

      if (!result || result.length === 0) {
        throw new ServerError("Episode not created");
      }

      const created = result[0];
      if (!created) {
        throw new ServerError("Unexpected error: Created episode is undefined");
      }

      return new Episode(created);
    } catch (error) {
      throw new ServerError(
        `Failed to create episode: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async updateEpisode(
    id: string,
    props: Partial<NewEpisodeRow>
  ): Promise<Episode> {
    try {
      const result = await db
        .update(episodesSchema)
        .set(props)
        .where(eq(episodesSchema.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new ServerError("Episode not found or not updated");
      }

      const updated = result[0];
      if (!updated) {
        throw new ServerError("Unexpected error: Updated episode is undefined");
      }

      return new Episode(updated);
    } catch (error) {
      throw new ServerError(
        `Failed to update episode ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async deleteEpisode(id: string): Promise<void> {
    try {
      await db.delete(episodesSchema).where(eq(episodesSchema.id, id));
    } catch (error) {
      throw new ServerError(
        `Failed to delete episode ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }
}
