import type { NewSeasonRow } from "../../infrastructure/database/seasons.schema";
import type { Season } from "../seasons.entity";

export interface ISeasonsRepository {
  getSeasonById(
    id: string,
    options?: { withEpisodes?: boolean }
  ): Promise<Season | null>;

  getSeasonsBySeriesId(
    seriesId: string,
    options?: { withEpisodes?: boolean; seasonNumber?: number }
  ): Promise<Season[]>;

  createSeason(props: NewSeasonRow): Promise<Season>;

  updateSeason(id: string, props: Partial<NewSeasonRow>): Promise<Season>;

  deleteSeason(id: string): Promise<void>;
}
