import { and, eq, or, type SQL } from "drizzle-orm";
import { db } from "../../../../../../database";
import type { PaginationQuery } from "../../../../../../shared/schemas/base/pagination.schema";
import type {
  Content,
  CreateContentProps,
} from "../../../../domain/entities/content.entity";
import { contentSchema } from "../../schemas/contents.schema";

export type ContentType = "movie" | "serie";

/**
 * Base Drizzle Adapter
 * Provides shared database operations for content (movies and series)
 */
export abstract class BaseDrizzleAdapter<
  TEntity extends Content,
  TCreateProps extends CreateContentProps,
> {
  protected abstract contentType: ContentType;
  protected abstract createEntity(row: unknown): TEntity;

  /**
   * Get content by ID
   */
  async getContentById(id: string): Promise<TEntity | null> {
    const result = await db.query.content.findFirst({
      where: and(
        eq(contentSchema.id, id),
        eq(contentSchema.type, this.contentType)
      ),
    });

    if (!result) {
      return null;
    }

    return this.createEntity(result);
  }

  /**
   * List content with optional filters
   */
  async listContent(
    title?: string,
    _country?: string,
    _categories?: string[],
    tmdbIds?: number[],
    options?: PaginationQuery
  ): Promise<TEntity[]> {
    const conditions: SQL[] = [eq(contentSchema.type, this.contentType)];

    if (title) {
      conditions.push(eq(contentSchema.title, title));
    }

    if (tmdbIds && tmdbIds.length > 0) {
      conditions.push(
        or(...tmdbIds.map((id) => eq(contentSchema.tmdbId, id)))!
      );
    }

    // Note: country and categories filtering require joins with related tables
    // For now, they are accepted but not used in the query

    const query = db
      .select()
      .from(contentSchema)
      .where(and(...conditions));

    // Apply pagination
    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.page && options?.limit) {
      const offset = (options.page - 1) * options.limit;
      query.offset(offset);
    }

    const result = await query;

    return result.map((row) => this.createEntity(row));
  }

  /**
   * Check which content items exist in the database by TMDB IDs
   */
  async checkContentExistsInDb<Id extends number>(
    tmdbIds: Id[]
  ): Promise<Record<Id, boolean>> {
    const result = await this.listContent(
      undefined,
      undefined,
      undefined,
      tmdbIds
    );

    const contentStatusInDatabase: Record<Id, boolean> = tmdbIds.reduce(
      (acc, id) => {
        acc[id] = result.some((content) => content.tmdbId === id);
        return acc;
      },
      {} as Record<Id, boolean>
    );

    return contentStatusInDatabase;
  }

  /**
   * Create content in the database
   */
  async createContent(props: TCreateProps): Promise<TEntity> {
    const result = await db.insert(contentSchema).values(props).returning();

    if (!result || result.length === 0) {
      throw new Error(`${this.contentType} not created`);
    }

    const createdContent = result[0];

    if (!createdContent) {
      throw new Error(
        `Unexpected error: Created ${this.contentType} is undefined`
      );
    }

    return this.createEntity(createdContent);
  }

  /**
   * Update content in the database
   */
  async updateContent(
    id: string,
    props: Partial<TCreateProps>
  ): Promise<TEntity> {
    const result = await db
      .update(contentSchema)
      .set(props)
      .where(
        and(eq(contentSchema.id, id), eq(contentSchema.type, this.contentType))
      )
      .returning();

    if (!result || result.length === 0) {
      throw new Error(`${this.contentType} not found or not updated`);
    }

    const updatedContent = result[0];

    if (!updatedContent) {
      throw new Error(
        `Unexpected error: Updated ${this.contentType} is undefined`
      );
    }

    return this.createEntity(updatedContent);
  }

  /**
   * Delete content from the database
   */
  async deleteContent(id: string): Promise<void> {
    await db
      .delete(contentSchema)
      .where(
        and(eq(contentSchema.id, id), eq(contentSchema.type, this.contentType))
      );
  }

  /**
   * Get total count of content items
   */
  async getContentCount(
    title?: string,
    _country?: string,
    _categories?: string[]
  ): Promise<number> {
    const conditions: SQL[] = [eq(contentSchema.type, this.contentType)];

    if (title) {
      conditions.push(eq(contentSchema.title, title));
    }

    const result = await db
      .select()
      .from(contentSchema)
      .where(and(...conditions));

    return result.length;
  }
}
