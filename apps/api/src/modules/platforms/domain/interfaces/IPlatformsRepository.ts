import type { NewStreamingPlatformRow } from "../../infrastructure/database/platforms.schema";
import type {
  Platform,
  UpdatePlatformProps,
} from "../entities/platforms.entity";

export interface IPlatformsRepository {
  create(platform: NewStreamingPlatformRow): Promise<Platform>;
  list(withContent?: boolean): Promise<Platform[]>;
  getById(id: string): Promise<Platform>;
  update(id: string, platform: UpdatePlatformProps): Promise<Platform>;
  delete(id: string): Promise<void>;
  findByTmdbIds(tmdbIds: number[]): Promise<Platform[]>;
}
