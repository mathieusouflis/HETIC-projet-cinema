import { Content } from "../../../contents/domain/entities/content.entity.js";
import { ContentRow, NewContentRow } from "../../../contents/infrastructure/database/schemas/contents.schema";


export class Movie extends Content {

  constructor(props: ContentRow) {
    super({ ...props, type: "movie" });
  }

  /**
   * @returns true
   */
  public isMovie(): boolean {
    return true
  }

  /**
   * @returns false
   */
  public isSeries(): boolean {
    return false;
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
