import {
  ConflictError,
  NotFoundError,
} from "../../../../../shared/errors/index.js";
import type {
  Category,
  UpdateCategoryProps,
} from "../../../../categories/domain/entities/category.entity.js";
import type { ICategoryRepository } from "../../../../categories/domain/interfaces/ICategoryRepository.js";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string, data: UpdateCategoryProps): Promise<Category> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundError("Category not found");
    }
    if (data.name !== undefined && data.name !== existingCategory.name) {
      const existingByName = await this.categoryRepository.existsByName(
        data.name
      );
      if (existingByName) {
        throw new ConflictError("Category with this name already exists");
      }
    }

    if (data.slug !== undefined && data.slug !== existingCategory.slug) {
      const existingBySlug = await this.categoryRepository.existsBySlug(
        data.slug
      );
      if (existingBySlug) {
        throw new ConflictError("Category with this slug already exists");
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, data);

    return updatedCategory;
  }
}
