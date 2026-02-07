import { Entity } from "../../../shared/domain/entity";
import type {
  Content,
  ContentRelations,
} from "../../contents/domain/entities/content.entity";
import type { Watchparty } from "../../watchparty";
import type {
  SeasonRow,
  seasonsRelationsSchema,
} from "../infrastructure/database/seasons.schema";

export interface SeasonsRelations {
  content: Content;
  episodes: Content[];
  watchparties: Watchparty;
}

export class Season extends Entity<
  SeasonRow,
  typeof seasonsRelationsSchema,
  ContentRelations
> {
  public readonly id: string;
  public readonly seriesId: string;
  public readonly name: string | null;
  public readonly seasonNumber: number;
  public readonly episodeCount: number | null;
  public readonly overview: string | null;
  public readonly posterUrl: string | null;
  public readonly airDate: string | null;

  constructor(props: SeasonRow) {
    super();
    this.id = props.id;
    this.seriesId = props.seriesId;
    this.name = props.name;
    this.seasonNumber = props.seasonNumber;
    this.episodeCount = props.episodeCount;
    this.overview = props.overview;
    this.posterUrl = props.posterUrl;
    this.airDate = props.airDate;
  }

  public hasPoster(): boolean {
    return !!this.posterUrl;
  }

  public isOut(): boolean {
    return this.airDate !== null && new Date(this.airDate) < new Date();
  }
  public toJSON() {
    return {
      id: this.id,
      seriesId: this.seriesId,
      name: this.name ?? null,
      seasonNumber: this.seasonNumber,
      episodeCount: this.episodeCount ?? null,
      overview: this.overview ?? null,
      posterUrl: this.posterUrl ?? null,
      airDate: this.airDate ?? null,
    };
  }
}
