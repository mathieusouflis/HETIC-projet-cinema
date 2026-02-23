import type { PaginationQuery } from "../../../../shared/services/pagination";
import type { Content } from "../entities/content.entity";

export interface IContentRepository {
  listContents: (
    type?: string,
    title?: string,
    country?: string,
    categories?: string[],
    withCategory?: boolean,
    withPlatform?: boolean,
    withCast?: boolean,
    withSeason?: boolean,
    withEpisode?: boolean,
    options?: PaginationQuery
  ) => Promise<{ data: Content[]; total: number }>;
  searchContents: (
    query: string,
    type?: string,
    options?: PaginationQuery
  ) => Promise<Content[]>;
  getContentById: (params: {
    id: string;
    withCast?: boolean;
    withCategory?: boolean;
    withPlatform?: boolean;
    withSeason?: boolean;
    withEpisode?: boolean;
  }) => Promise<Content | undefined>;
}
