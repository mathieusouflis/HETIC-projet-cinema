import { eq, inArray } from "drizzle-orm";
import { db } from "../../../../database";
import { streamingPlatforms } from "../../../../database/schema";
import { ServerError } from "../../../../shared/errors";
import { Content } from "../../../contents/domain/entities/content.entity";
import {
  Platform,
  type UpdatePlatformProps,
} from "../../domain/entities/platforms.entity";
import type { IPlatformsRepository } from "../../domain/interfaces/IPlatformsRepository";
import type { NewStreamingPlatformRow } from "./platforms.schema";

export class PlatformsRepository implements IPlatformsRepository {
  async create(platform: NewStreamingPlatformRow): Promise<Platform> {
    const result = await db
      .insert(streamingPlatforms)
      .values(platform)
      .returning();

    if (!result[0]) {
      throw new ServerError("Failed to create platform");
    }

    return new Platform(result[0]);
  }

  async list(withContent?: boolean): Promise<Platform[]> {
    const result = await db.query.streamingPlatforms.findMany({
      with: {
        contents: {
          with: {
            content: true,
          },
        },
      },
    });

    return result.map((row) => {
      const platform = new Platform(row);
      if (withContent) {
        platform.setRelations(
          "contents",
          row.contents.map((content) => new Content(content.content))
        );
      }
      return platform;
    });
  }

  async getById(id: string): Promise<Platform> {
    const result = await db
      .select()
      .from(streamingPlatforms)
      .where(eq(streamingPlatforms.id, id))
      .limit(1);

    if (!result[0]) {
      throw new ServerError("Platform not found");
    }

    return new Platform(result[0]);
  }

  async update(id: string, platform: UpdatePlatformProps): Promise<Platform> {
    const result = await db
      .update(streamingPlatforms)
      .set(platform)
      .where(eq(streamingPlatforms.id, id))
      .returning();

    if (!result[0]) {
      throw new ServerError("Failed to update platform");
    }

    return new Platform(result[0]);
  }

  async delete(id: string): Promise<void> {
    await db.delete(streamingPlatforms).where(eq(streamingPlatforms.id, id));
  }

  async findByTmdbIds(tmdbIds: number[]): Promise<Platform[]> {
    const response = await db
      .select()
      .from(streamingPlatforms)
      .where(inArray(streamingPlatforms.tmdbId, tmdbIds));

    return response.map((row) => new Platform(row));
  }
}
