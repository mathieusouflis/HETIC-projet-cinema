import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../../database";
import { ServerError } from "../../../../shared/errors/server-error";
import { Content } from "../../../contents/domain/entities/content.entity";
import { Episode } from "../../../episodes/domain/episode.entity";
import type { ISeasonsRepository } from "../../domain/interfaces/ISeasonsRepository";
import { Season } from "../../domain/seasons.entity";
import { type NewSeasonRow, seasonsSchema } from "./seasons.schema";

export class SeasonsDatabaseRepository implements ISeasonsRepository {
  async getSeasonById(
    id: string,
    options?: { withEpisodes?: boolean }
  ): Promise<Season | null> {
    try {
      const result = await db.query.seasons.findFirst({
        where: eq(seasonsSchema.id, id),
        with: options?.withEpisodes
          ? {
              episodes: {
                orderBy: (episodes, { asc }) => [asc(episodes.episodeNumber)],
              },
            }
          : undefined,
      });

      if (!result) {
        return null;
      }

      const season = new Season(result);
      const resultAny = result as typeof result & { episodes?: unknown[] };

      if (options?.withEpisodes && resultAny.episodes) {
        season.setRelations(
          "episodes",
          resultAny.episodes.map((ep) => new Episode(ep as never)) as Episode[]
        );
      }

      return season;
    } catch (error) {
      throw new ServerError(
        `Failed to get season by id ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async getSeasonsBySeriesId(
    seriesId: string,
    options?: { withEpisodes?: boolean; seasonNumber?: number }
  ): Promise<Season[]> {
    try {
      const conditions = [eq(seasonsSchema.seriesId, seriesId)];

      if (options?.seasonNumber !== undefined) {
        conditions.push(eq(seasonsSchema.seasonNumber, options.seasonNumber));
      }

      const result = await db.query.seasons.findMany({
        where: and(...conditions),
        orderBy: (seasons, { asc }) => [asc(seasons.seasonNumber)],
        with: options?.withEpisodes
          ? {
              episodes: {
                orderBy: (episodes, { asc }) => [asc(episodes.episodeNumber)],
              },
            }
          : undefined,
      });

      return result.map((row) => {
        const season = new Season(row);

        const rowAny = row as typeof row & { episodes?: unknown[] };

        if (options?.withEpisodes && rowAny.episodes) {
          season.setRelations(
            "episodes",
            rowAny.episodes.map((ep) => new Episode(ep as never)) as Episode[]
          );
        }

        return season;
      });
    } catch (error) {
      throw new ServerError(
        `Failed to get seasons for series ${seriesId}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async createSeason(props: NewSeasonRow): Promise<Season> {
    try {
      const result = await db.insert(seasonsSchema).values(props).returning();

      if (!result || result.length === 0) {
        throw new ServerError("Season not created");
      }

      const created = result[0];
      if (!created) {
        throw new ServerError("Unexpected error: Created season is undefined");
      }

      return new Season(created);
    } catch (error) {
      throw new ServerError(
        `Failed to create season: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async updateSeason(
    id: string,
    props: Partial<NewSeasonRow>
  ): Promise<Season> {
    try {
      const result = await db
        .update(seasonsSchema)
        .set(props)
        .where(eq(seasonsSchema.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new ServerError("Season not found or not updated");
      }

      const updated = result[0];
      if (!updated) {
        throw new ServerError("Unexpected error: Updated season is undefined");
      }

      return new Season(updated);
    } catch (error) {
      throw new ServerError(
        `Failed to update season ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async deleteSeason(id: string): Promise<void> {
    try {
      await db.delete(seasonsSchema).where(eq(seasonsSchema.id, id));
    } catch (error) {
      throw new ServerError(
        `Failed to delete season ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async getByTmdbIds(ids: number[]): Promise<Season[]> {
    try {
      const result = await db
        .select()
        .from(seasonsSchema)
        .where(inArray(seasonsSchema.tmdbId, ids));

      if (!result || result.length === 0) {
        throw new ServerError("Season not found");
      }

      return result.map((season) => new Season(season));
    } catch (error) {
      throw new ServerError(
        `Failed to get seasons by tmdb ids: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  async getByTmdbId(id: number): Promise<Season> {
    try {
      const result = await db.query.seasons.findFirst({
        where: eq(seasonsSchema.tmdbId, id),
        with: {
          content: true,
        },
      });

      if (!result) {
        throw new ServerError("Season not found");
      }

      const season = new Season(result);
      season.setRelation("content", new Content(result.content));

      return season;
    } catch (error) {
      throw new ServerError(
        `Failed to get seasons by tmdb ids: ${error instanceof Error ? error.message : error}`
      );
    }
  }
}
