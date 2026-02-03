import type { RelationsToJSON } from "../../../../shared/domain/entity.js";
import {
  Content,
  type ContentJSON,
  type ContentRelations,
} from "../../../contents/domain/entities/content.entity.js";
import type {
  ContentRow,
  NewContentRow,
} from "../../../contents/infrastructure/database/schemas/contents.schema.js";

export interface SerieJSON extends Omit<ContentJSON, "type"> {
  type: "serie";
}

export class Serie extends Content {
  public override readonly type = "serie" as const;

  constructor(props: ContentRow) {
    super({ ...props, type: "serie" });
  }

  /**
   * @returns false
   */
  public override isMovie(): boolean {
    return false;
  }

  /**
   * @returns true
   */
  public override isSeries(): boolean {
    return true;
  }

  /**
   * Convert entity to a plain object with narrowed type
   */
  public override toJSON(): SerieJSON {
    const response = super.toJSON();
    return {
      ...response,
      type: "serie" as const,
    };
  }

  /**
   * Convert entity and relations to JSON with properly narrowed type
   */
  public override toJSONWithRelations<
    K extends keyof ContentRelations = keyof ContentRelations,
  >(
    options?: Partial<Record<K, boolean>>
  ): SerieJSON & Partial<RelationsToJSON<ContentRelations>> {
    const result = super.toJSONWithRelations(options);
    return {
      ...result,
      type: "serie" as const,
    };
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
