import type {
  CategoryRow,
  NewCategoryRow,
} from "../../infrastructure/database/schemas/categories.schema.js";

export class Category {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly tmdbId: number | null;
  public readonly description: string | null;
  public readonly createdAt: Date;

  constructor(props: CategoryRow) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description ?? null;
    this.tmdbId = props.tmdbId ?? null;
    this.createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
  }

  /**
   * Check if the category has a description
   * @returns true if description is set
   */
  public hasDescription(): boolean {
    return this.description !== null && this.description.length > 0;
  }

  /**
   * Generate a slug from a name
   * @param name - Category name
   * @returns Generated slug
   */
  public static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Convert entity to a plain object (for serialization)
   * @returns Plain object representation without methods
   */
  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      tmdbId: this.tmdbId,
      description: this.description,
      createdAt: this.createdAt,
    };
  }
}

export type CreateCategoryProps = Omit<NewCategoryRow, "slug"> & {
  slug?: string;
};

export type UpdateCategoryProps = Partial<
  Pick<CategoryRow, "name" | "slug" | "description">
>;
