import { Entity } from "../../../shared/domain/entity";
import type { Season } from "../../seasons/domain/seasons.entity";
import type { Watchparty } from "../../watchparty";
import type {
  EpisodeRow,
  episodesRelationsSchema,
} from "../infrastructure/database/episodes.schema";

export type EpisodeRelations = {
  season: Season;
  watchParties: Watchparty[];
};

export class Episode extends Entity<
  EpisodeRow,
  typeof episodesRelationsSchema,
  EpisodeRelations
> {
  public readonly name: string;
  public readonly id: string;
  public readonly seasonId: string;
  public readonly episodeNumber: number;
  public readonly overview: string | null;
  public readonly stillUrl: string | null;
  public readonly airDate: string | null;
  public readonly durationMinutes: number | null;
  public readonly tmdbId: number | null;

  constructor(props: EpisodeRow) {
    super();
    this.name = props.name;
    this.id = props.id;
    this.seasonId = props.seasonId;
    this.episodeNumber = props.episodeNumber;
    this.overview = props.overview;
    this.stillUrl = props.stillUrl;
    this.airDate = props.airDate;
    this.durationMinutes = props.durationMinutes;
    this.tmdbId = props.tmdbId;
  }

  public isOut(): boolean {
    return this.airDate !== null && new Date(this.airDate) < new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      seasonId: this.seasonId,
      episodeNumber: this.episodeNumber,
      overview: this.overview ?? null,
      stillUrl: this.stillUrl ?? null,
      airDate: this.airDate ?? null,
      durationMinutes: this.durationMinutes ?? null,
      tmdbId: this.tmdbId ?? null,
    };
  }
}
