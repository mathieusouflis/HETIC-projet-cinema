import { and, count, eq, inArray, type SQL } from "drizzle-orm";
import { db } from "../../../database";
import { contentCategories } from "../../../database/schema";
import { Category } from "../../../modules/categories/domain/entities/category.entity";
import { contentSchema } from "../../../modules/contents/infrastructure/database/schemas/contents.schema";
import { ServerError } from "../../errors/server-error";
import type { PagePaginationQuery } from "../../services/pagination";

/**
 * Base interface for entities that can be created
 */
export interface BaseContentProps {
  type: "movie" | "serie";
  genres?: Array<{ id: number; name: string }>;
  [key: string]: any;
}

/**
 * Base interface for entities
 */
export interface BaseEntity {
  id: string;
  tmdbId?: number | null;
  setRelations(key: string, value: any): void;
}

/**
 * Base Drizzle Repository
 * Contains shared CRUD operations for content entities (movies, series)
 *
 * @template TEntity - The entity type (Movie or Serie)
 * @template TProps - The entity properties type
 * @template TCreateProps - The creation properties type
 */
export abstract class BaseDrizzleRepository<
  TEntity extends BaseEntity,
  TProps,
  TCreateProps extends BaseContentProps,
> {
  protected abstract readonly contentType: "movie" | "serie";
  protected abstract readonly entityName: string; // "movie", "series" for error messages

  /**
   * Create entity instance from database row
   * Must be implemented by subclasses
   */
  protected abstract createEntity(row: TProps): TEntity;

  /**
   * Get content by TMDB IDs
   */
  async getByTmdbIds(tmdbIds: number[]): Promise<TEntity[]> {
    try {
      if (tmdbIds.length === 0) {
        return [];
      }

      const result = await db.query.content.findMany({
        where: and(
          eq(contentSchema.type, this.contentType),
          inArray(contentSchema.tmdbId, tmdbIds)
        ),
        with: {
          contentCategories: {
            with: {
              category: true,
            },
          },
        },
      });

      return result.map((row) => {
        const entity = this.createEntity(row as TProps);
        if (row.contentCategories) {
          entity.setRelations(
            "contentCategories",
            row.contentCategories.map((cc) => new Category(cc.category))
          );
        }
        return entity;
      });
    } catch (error) {
      throw new ServerError(
        `Failed to get ${this.entityName} by TMDB IDs: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Get content by ID
   */
  async getById(
    id: string,
    options?: { withCategories?: boolean }
  ): Promise<TEntity | null> {
    try {
      const result = await db.query.content.findFirst({
        where: and(
          eq(contentSchema.id, id),
          eq(contentSchema.type, this.contentType)
        ),
        with: {
          contentCategories: {
            with: {
              category: true,
            },
          },
        },
      });

      if (!result) {
        return null;
      }

      const entity = this.createEntity(result as TProps);
      if (result.contentCategories && options?.withCategories) {
        entity.setRelations(
          "contentCategories",
          result.contentCategories.map((cc) => new Category(cc.category))
        );
      }

      return entity;
    } catch (error) {
      throw new ServerError(
        `Failed to get ${this.entityName} by id ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * List content with filters and pagination
   */
  async list(
    title?: string,
    _country?: string,
    categories?: string[],
    withCategory?: boolean,
    options?: PagePaginationQuery
  ): Promise<{ data: TEntity[]; total: number }> {
    try {
      const conditions: SQL[] = [eq(contentSchema.type, this.contentType)];

      if (title) {
        conditions.push(eq(contentSchema.title, title));
      }

      if (categories && categories.length > 0) {
        conditions.push(inArray(contentCategories.categoryId, categories));
      }

      // TODO: Add country filter

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
          const entity = this.createEntity(row as TProps);
          if (withCategory && row.contentCategories) {
            entity.setRelations(
              "contentCategories",
              row.contentCategories.map((cc) => new Category(cc.category))
            );
          }
          return entity;
        }),
        total,
      };
    } catch (error) {
      throw new ServerError(
        `Failed to list ${this.entityName}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Create new content
   */
  async create(props: TCreateProps): Promise<TEntity> {
    try {
      const { genres, ...contentData } = props;

      const result = await db
        .insert(contentSchema)
        .values(contentData as any) // Type assertion needed for generic Drizzle operation
        .returning();

      if (!result || result.length === 0) {
        throw new ServerError(`${this.entityName} not created`);
      }

      const created = result[0];

      if (!created) {
        throw new ServerError(
          `Unexpected error: Created ${this.entityName} is undefined`
        );
      }

      return this.createEntity(created as TProps);
    } catch (error) {
      throw new ServerError(
        `Failed to create ${this.entityName}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Update content
   */
  async update(id: string, props: Partial<TCreateProps>): Promise<TEntity> {
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
        throw new ServerError(`${this.entityName} not found or not updated`);
      }

      const updated = result[0];

      if (!updated) {
        throw new ServerError(
          `Unexpected error: Updated ${this.entityName} is undefined`
        );
      }

      return this.createEntity(updated as TProps);
    } catch (error) {
      throw new ServerError(
        `Failed to update ${this.entityName} with id ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Delete content
   */
  async delete(id: string): Promise<void> {
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
        `Failed to delete ${this.entityName} with id ${id}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Get count of content
   */
  async getCount(
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
        .select({ count: count() })
        .from(contentSchema)
        .where(and(...conditions));

      return result[0]?.count ?? 0;
    } catch (error) {
      throw new ServerError(
        `Failed to get ${this.entityName} count: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Link categories to content
   */
  async linkCategories(
    contentId: string,
    categoryIds: string[]
  ): Promise<void> {
    try {
      if (categoryIds.length === 0) {
        return;
      }

      const values = categoryIds.map((categoryId) => ({
        contentId,
        categoryId,
      }));

      await db.insert(contentCategories).values(values).onConflictDoNothing();
    } catch (error) {
      throw new ServerError(
        `Failed to link categories to ${this.entityName} ${contentId}: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Check if content exists by TMDB IDs
   */
  async checkExistsByTmdbIds(
    tmdbIds: number[]
  ): Promise<Record<number, boolean>> {
    try {
      if (tmdbIds.length === 0) {
        return {};
      }

      const existing = await this.getByTmdbIds(tmdbIds);
      const existingTmdbIds = existing
        .map((item) => item.tmdbId)
        .filter((id): id is number => id !== null && id !== undefined);

      const statusMap: Record<number, boolean> = {};
      for (const id of tmdbIds) {
        statusMap[id] = existingTmdbIds.includes(id);
      }

      return statusMap;
    } catch (error) {
      throw new ServerError(
        `Failed to check ${this.entityName} existence: ${error instanceof Error ? error.message : error}`
      );
    }
  }
}
