import { eq } from "drizzle-orm";
import { db } from "../../../../../../database";
import { tmdbFetchStatusSchema } from "../../schemas/tmdb-fetch-status.schema";

type DiscoverMetadatas = {
  page: number;
};

type PathMetadata = DiscoverMetadatas;

export class TMDBFetchStatusRepository {
  async setPathMetadatas(path: string, metadata: PathMetadata): Promise<void> {
    await db.insert(tmdbFetchStatusSchema)
      .values({ path, type: "discover", metadata })
      .onConflictDoUpdate({
        target: tmdbFetchStatusSchema.path,
        set: { metadata },
      });
  }

  async getPathMetadatas(path: string): Promise<PathMetadata> {
    const result = await db.query.tmdbFetchStatus.findFirst({
      where: eq(tmdbFetchStatusSchema.path, path),
    });

    if (!result) {
      throw new Error(`Path "${path}" not found`);
    }

    if (result.type !== "discover") {
      throw new Error(`Path type "${result.type}" not supported.`);
    }

    return result.metadata as DiscoverMetadatas;
  }
}
