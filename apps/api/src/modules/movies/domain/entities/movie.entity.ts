import type { RelationsToJSON } from "../../../../shared/domain/entity.js";
import {
  Content,
  type ContentJSON,
  type ContentRelations,
} from "../../../contents/domain/entities/content.entity.js";
import type {
  ContentRow,
  NewContentRow,
} from "../../../contents/infrastructure/database/schemas/contents.schema";

export interface MovieJSON extends Omit<ContentJSON, "type"> {
  type: "movie";
}

export class Movie extends Content {
  public override readonly type = "movie" as const;

  constructor(props: ContentRow) {
    super({ ...props, type: "movie" });
  }

  /**
   * @returns true
   */
  public override isMovie(): boolean {
    return true;
  }

  /**
   * @returns false
   */
  public override isSeries(): boolean {
    return false;
  }

  /**
   * Convert entity to a plain object with narrowed type
   */
  public override toJSON(): MovieJSON {
    const response = super.toJSON();
    return {
      ...response,
      type: "movie" as const,
    };
  }

  /**
   * Convert entity and relations to JSON with properly narrowed type
   */
  public override toJSONWithRelations<
    K extends keyof ContentRelations = keyof ContentRelations,
  >(
    options?: Partial<Record<K, boolean>>
  ): MovieJSON & Partial<RelationsToJSON<ContentRelations>> {
    const result = super.toJSONWithRelations(options);
    return {
      ...result,
      type: "movie" as const,
    };
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
