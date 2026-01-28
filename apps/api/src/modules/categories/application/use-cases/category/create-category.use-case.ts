import { ConflictError } from "../../../../../shared/errors/index.js";
import {
  Category,
  type CreateCategoryProps,
} from "../../../domain/entities/category.entity.js";
import type { ICategoryRepository } from "../../../domain/interfaces/ICategoryRepository.js";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(data: CreateCategoryProps): Promise<Category> {
    const slug = data.slug || Category.generateSlug(data.name);

    const existingByName = await this.categoryRepository.existsByName(
      data.name
    );
    if (existingByName) {
      throw new ConflictError("Category with this name already exists");
    }

    const existingBySlug = await this.categoryRepository.existsBySlug(slug);
    if (existingBySlug) {
      throw new ConflictError("Category with this slug already exists");
    }

    const category = await this.categoryRepository.create({
      name: data.name,
      slug,
      description: data.description,
    });

    return category;
  }
}
