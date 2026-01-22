import { Content } from "../../../contents/domain/entities/content.entity.js";
import { ContentRow, NewContentRow } from "../../../contents/infrastructure/database/schemas/contents.schema.js";


export class Serie extends Content {

  constructor(props: ContentRow) {
    super({ ...props, type: "serie" });
  }

  /**
   * @returns false
   */
  public isMovie(): boolean {
    return false
  }

  /**
   * @returns true
   */
  public isSeries(): boolean {
    return true;
  }

}

export type SerieProps = ContentRow & {
  type: "serie";
};

export type CreateSerieProps = {
  type: "serie";
} & NewContentRow;

export type UpdateSerieProps = Partial<
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
