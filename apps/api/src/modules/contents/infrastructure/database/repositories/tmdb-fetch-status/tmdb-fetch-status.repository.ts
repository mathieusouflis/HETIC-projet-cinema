import { eq } from "drizzle-orm";
import { db } from "../../../../../../database";
import { tmdbFetchStatusSchema } from "../../schemas/tmdb-fetch-status.schema";
import { MetadataNotFoundError } from "./errors/metadata-not-found";
import { UnsupportedStatusTypeError } from "./errors/unsuported-status-type";

type DiscoverMetadatas = {
  page: number;
};

type PathMetadata = DiscoverMetadatas;

export class TMDBFetchStatusRepository {
  async setPathMetadatas(path: string, metadata: PathMetadata): Promise<void> {
    await db.insert(tmdbFetchStatusSchema)
      .values({ path, type: "discover", metadata })
      .onConflictDoUpdate({
        target: [tmdbFetchStatusSchema.path],
        set: { metadata },
      });
  }
    async getPathMetadatas(path: string): Promise<DiscoverMetadatas> {
      const result = await db.query.tmdbFetchStatus.findFirst({
        where: eq(tmdbFetchStatusSchema.path, path),
      });

      if (!result) {
        throw new MetadataNotFoundError(path);
      }

      if (result.type !== "discover") {
        throw new UnsupportedStatusTypeError(result.type);
      }

      return result.metadata as DiscoverMetadatas;
    }
  }
