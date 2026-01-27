import type { PaginationQuery } from "../../../../shared/schemas/base/pagination.schema";
import type { Content } from "../entities/content.entity";

export interface IContentRepository {
  listContents: (
    type?: string,
    title?: string,
    country?: string,
    categories?: string[],
    options?: PaginationQuery
  ) => Promise<Content[]>;
  searchContents: (
    query: string,
    type?: string,
    options?: PaginationQuery
  ) => Promise<Content[]>;
  getContentById: (id: string) => Promise<Content | undefined>;
}
