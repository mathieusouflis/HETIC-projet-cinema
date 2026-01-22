import { logger } from "@packages/logger";
import { PaginationQuery } from "../../../../../../shared/schemas/base/pagination.schema";
import { Content, CreateContentProps } from "../../../../domain/entities/content.entity";
import { BaseTMDBAdapter } from "./base-tmdb.adapter";
import { BaseDrizzleAdapter } from "./base-drizzle.adapter";

/**
 * Base Content Repository
 * Provides shared logic for Movie and Serie repositories
 */
export abstract class BaseContentRepository<
  TEntity extends Content,
  TCreateProps extends CreateContentProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TTMDBAdapter extends BaseTMDBAdapter<any, TCreateProps>,
  TDrizzleAdapter extends BaseDrizzleAdapter<TEntity, TCreateProps>
> {
  protected tmdbAdapter: TTMDBAdapter;
  protected drizzleAdapter: TDrizzleAdapter;
  protected abstract contentTypeName: string;

  constructor(tmdbAdapter: TTMDBAdapter, drizzleAdapter: TDrizzleAdapter) {
    this.tmdbAdapter = tmdbAdapter;
    this.drizzleAdapter = drizzleAdapter;
  }

  /**
   * Create content in the database
   */
  async create(props: TCreateProps): Promise<TEntity> {
    return await this.drizzleAdapter.createContent(props);
  }

  /**
   * Get content by ID
   */
  async getById(id: string): Promise<TEntity | null> {
    return await this.drizzleAdapter.getContentById(id);
  }

  /**
   * Process TMDB content: check if exists and create missing ones
   */
  protected async processContent(tmdbContent: TCreateProps[]): Promise<TEntity[]> {
    const tmdbIds = tmdbContent
      .map((item) => item.tmdbId)
      .filter((id) => id !== null && id !== undefined) as number[];

    if (tmdbIds.length === 0) {
      return [];
    }

    const existingContentStatus = await this.drizzleAdapter.checkContentExistsInDb(tmdbIds);
    const contentToCreate = tmdbContent.filter(
      (item) => item.tmdbId && !existingContentStatus[item.tmdbId]
    );

    if (contentToCreate.length === 0) {
      return [];
    }

    return await Promise.all(
      contentToCreate.map((item) => this.drizzleAdapter.createContent(item))
    );
  }

  /**
   * List content with various filters
   */
  async list(
    title?: string,
    country?: string,
    categories?: string[],
    options?: PaginationQuery
  ): Promise<TEntity[]> {
    let tmdbContent: TCreateProps[] = [];

    logger.info(`Listing ${this.contentTypeName}`);

    // Determine which TMDB endpoint to use
    if (title && !country && !categories) {
      logger.info(`Searching ${this.contentTypeName} by title: "${title}"`);
      tmdbContent = await this.tmdbAdapter.searchContent(title, options?.page);
    } else if (title && (country || categories)) {
      logger.info(`Searching ${this.contentTypeName} by title and filters`);
      const searchResults = await this.tmdbAdapter.searchContent(title, options?.page);
      const discoverResults = await this.tmdbAdapter.listContent(
        country,
        categories,
        options?.page
      );
      tmdbContent = [...searchResults, ...discoverResults];
    } else {
      logger.info(`Listing ${this.contentTypeName} by filters`);
      tmdbContent = await this.tmdbAdapter.listContent(country, categories, options?.page);
    }

    // Process TMDB results (create missing items in DB)
    const createdContent = await this.processContent(tmdbContent);

    // Get existing content from DB
    const listedContent = await this.drizzleAdapter.listContent(
      title,
      country,
      categories,
      undefined,
      options
    );

    return [...createdContent, ...listedContent];
  }

  /**
   * Search content by query
   */
  async search(query: string, options?: PaginationQuery): Promise<TEntity[]> {
    logger.info(`Searching ${this.contentTypeName} with query: "${query}"`);

    const tmdbContent = await this.tmdbAdapter.searchContent(query, options?.page);
    const createdContent = await this.processContent(tmdbContent);

    // Note: We can also search in local database if needed
    // const localContent = await this.drizzleAdapter.searchContent(query, options);
    // return [...createdContent, ...localContent];

    return createdContent;
  }

  /**
   * Update content
   */
  async update(id: string, props: Partial<TCreateProps>): Promise<TEntity> {
    return await this.drizzleAdapter.updateContent(id, props);
  }

  /**
   * Delete content
   */
  async delete(id: string): Promise<void> {
    await this.drizzleAdapter.deleteContent(id);
  }

  /**
   * Get total count
   */
  async getCount(title?: string, country?: string, categories?: string[]): Promise<number> {
    return await this.drizzleAdapter.getContentCount(title, country, categories);
  }
}
