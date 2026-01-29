import { and, count, eq, or, type SQL } from "drizzle-orm";
import { db } from "../../../../../../database";
import { ServerError } from "../../../../../../shared/errors/ServerError";
import type { PaginationQuery } from "../../../../../../shared/schemas/base/pagination.schema";
import { Category } from "../../../../../categories/domain/entities/category.entity";
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
    try {
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
    } catch (error) {
      throw new ServerError(
        `Failed to get ${this.contentType} by id ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * List content with optional filters
   */
  async listContent(
    title?: string,
    _country?: string,
    _categories?: string[],
    tmdbIds?: number[],
    withCategory?: boolean,
    options?: PaginationQuery
  ): Promise<{ data: TEntity[]; total: number }> {
    try {
      const conditions: SQL[] = [eq(contentSchema.type, this.contentType)];

      if (title) {
        conditions.push(eq(contentSchema.title, title));
      }

      if (tmdbIds && tmdbIds.length > 0) {
        const tmdbCondition = or(
          ...tmdbIds.map((id) => eq(contentSchema.tmdbId, id))
        );
        if (tmdbCondition) {
          conditions.push(tmdbCondition);
        }
      }

      const [result, total] = await Promise.all([
        db.query.content.findMany({
          where: and(...conditions),
          limit: options?.limit,
          offset:
            options?.page && options?.limit
              ? (options.page - 1) * options.limit
              : undefined,
          with: {
            contentCategories: {
              with: {
                category: true,
              },
            },
          },
        }),
        db
          .select({ count: count() })
          .from(contentSchema)
          .where(and(...conditions))
          .then((res) => res[0]?.count ?? 0),
      ]);

      return {
        data: result.map((row) => {
          const entity = this.createEntity(row);
          if (withCategory) {
            entity.setRelations(
              "contentCategories",
              row.contentCategories.map(
                (category) => new Category(category.category)
              )
            );
          }
          return entity;
        }),
        total,
      };
    } catch (error) {
      throw new ServerError(
        `Failed to list ${this.contentType}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Check which content items exist in the database by TMDB IDs
   */
  async checkContentExistsInDb<Id extends number>(
    tmdbIds: Id[]
  ): Promise<Record<Id, boolean>> {
    try {
      const result = await this.listContent(
        undefined,
        undefined,
        undefined,
        tmdbIds
      );

      const contentStatusInDatabase: Record<Id, boolean> = tmdbIds.reduce(
        (acc, id) => {
          acc[id] = result.data.some((content) => content.tmdbId === id);
          return acc;
        },
        {} as Record<Id, boolean>
      );

      return contentStatusInDatabase;
    } catch (error) {
      throw new ServerError(
        `Failed to check ${this.contentType} existence: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Create content in the database
   */
  async createContent(props: TCreateProps): Promise<TEntity> {
    try {
      const result = await db.insert(contentSchema).values(props).returning();

      if (!result || result.length === 0) {
        throw new ServerError(`${this.contentType} not created`);
      }

      const createdContent = result[0];

      if (!createdContent) {
        throw new ServerError(
          `Unexpected error: Created ${this.contentType} is undefined`
        );
      }

      return this.createEntity(createdContent);
    } catch (error) {
      throw new ServerError(
        `Failed to create ${this.contentType}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Update content in the database
   */
  async updateContent(
    id: string,
    props: Partial<TCreateProps>
  ): Promise<TEntity> {
    try {
      const result = await db
        .update(contentSchema)
        .set(props)
        .where(
          and(
            eq(contentSchema.id, id),
            eq(contentSchema.type, this.contentType)
          )
        )
        .returning();

      if (!result || result.length === 0) {
        throw new ServerError(`${this.contentType} not found or not updated`);
      }

      const updatedContent = result[0];

      if (!updatedContent) {
        throw new ServerError(
          `Unexpected error: Updated ${this.contentType} is undefined`
        );
      }

      return this.createEntity(updatedContent);
    } catch (error) {
      throw new ServerError(
        `Failed to update ${this.contentType} with id ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Delete content from the database
   */
  async deleteContent(id: string): Promise<void> {
    try {
      await db
        .delete(contentSchema)
        .where(
          and(
            eq(contentSchema.id, id),
            eq(contentSchema.type, this.contentType)
          )
        );
    } catch (error) {
      throw new ServerError(
        `Failed to delete ${this.contentType} with id ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Get total count of content items
   */
  async getContentCount(
    title?: string,
    _country?: string,
    _categories?: string[]
  ): Promise<number> {
    try {
      const conditions: SQL[] = [eq(contentSchema.type, this.contentType)];

      if (title) {
        conditions.push(eq(contentSchema.title, title));
      }

      const result = await db
        .select()
        .from(contentSchema)
        .where(and(...conditions));

      return result.length;
    } catch (error) {
      throw new ServerError(
        `Failed to get ${this.contentType} count: ${error instanceof Error ? error.message : error}`
      );
    }
  }
}
