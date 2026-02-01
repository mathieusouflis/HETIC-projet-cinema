import { count, eq, inArray } from "drizzle-orm";
import { db } from "../../../../../../database/index.js";
import {
  categories,
  contentCategories,
} from "../../../../../../database/schema.js";
import {
  Category,
  type CreateCategoryProps,
  type UpdateCategoryProps,
} from "../../../../domain/entities/category.entity.js";
import type { ICategoryRepository } from "../../../../domain/interfaces/ICategoryRepository.js";
import type { CategoryRow } from "../../schemas/categories.schema.js";

export class CategoryRepository implements ICategoryRepository {
  private mapToDomain(row: CategoryRow): Category {
    return new Category(row);
  }

  async findById(id: string): Promise<Category | null> {
    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  async findByName(name: string): Promise<Category | null> {
    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  async existsByName(name: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.name, name));

    return (result?.count ?? 0) > 0;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.slug, slug));

    return (result?.count ?? 0) > 0;
  }

  async create(data: CreateCategoryProps): Promise<Category> {
    if (!data.slug) {
      throw new Error("Slug is required for creating a category");
    }

    const [row] = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        tmdbId: data.tmdbId ?? null,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create category");
    }

    return this.mapToDomain(row);
  }

  async update(id: string, data: UpdateCategoryProps): Promise<Category> {
    const updateData: Partial<CategoryRow> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const [row] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    if (!row) {
      throw new Error("Failed to update category or category not found");
    }

    return this.mapToDomain(row);
  }

  async delete(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ categories: Category[]; total: number }> {
    const offset = (options.page - 1) * options.limit;

    const [countResult, rows] = await Promise.all([
      db.select({ count: count() }).from(categories),
      db.select().from(categories).limit(options.limit).offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      categories: rows.map((row) => this.mapToDomain(row)),
      total,
    };
  }

  async findByTmdbIds(tmdbIds: number[]): Promise<Category[]> {
    const rows = await db
      .select()
      .from(categories)
      .where(inArray(categories.tmdbId, tmdbIds));

    return rows.map((row) => this.mapToDomain(row));
  }

  async findByContentId(contentId: string): Promise<Category[]> {
    const rows = await db
      .select()
      .from(contentCategories)
      .innerJoin(categories, eq(contentCategories.categoryId, categories.id))
      .where(eq(contentCategories.contentId, contentId));

    return rows.map((row) => this.mapToDomain(row.categories));
  }
}
