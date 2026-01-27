import { Content } from "../../../contents/domain/entities/content.entity.js";
import type {
  ContentRow,
  NewContentRow,
} from "../../../contents/infrastructure/database/schemas/contents.schema";

export class Movie extends Content {
  public readonly type = "movie";

  constructor(props: ContentRow) {
    super({ ...props, type: "movie" });
  }

  /**
   * @returns true
   */
  public isMovie(): boolean {
    return true;
  }

  /**
   * @returns false
   */
  public isSeries(): boolean {
    return false;
  }

  public toJSON() {
    const response = super.toJSON();
    return {
      ...response,
      type: "movie",
    } as const;
  }
}

export type MovieProps = ContentRow & {
  type: "movie";
};

export type CreateMovieProps = NewContentRow & {
  type: "movie";
};

export type UpdateMovieProps = Partial<
  Pick<
    ContentRow,
    | "posterUrl"
    | "backdropUrl"
    | "trailerUrl"
    | "averageRating"
    | "totalRatings"
    | "totalViews"
  >
>;
