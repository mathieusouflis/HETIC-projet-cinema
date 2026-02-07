import type { NewEpisodeRow } from "../../infrastructure/database/episodes.schema";
import type { Episode } from "../episode.entity";

export interface IEpisodesRepository {
  getEpisodeById(id: string): Promise<Episode | null>;

  getEpisodesBySeasonId(seasonId: string): Promise<Episode[]>;

  getEpisodeByNumber(
    seasonId: string,
    episodeNumber: number
  ): Promise<Episode | null>;

  createEpisode(props: NewEpisodeRow): Promise<Episode>;

  updateEpisode(id: string, props: Partial<NewEpisodeRow>): Promise<Episode>;

  deleteEpisode(id: string): Promise<void>;
}
