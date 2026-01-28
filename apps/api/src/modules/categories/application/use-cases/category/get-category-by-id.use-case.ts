import { NotFoundError } from "../../../../../shared/errors/index.js";
import type { Category } from "../../../../categories/domain/entities/category.entity.js";
import type { ICategoryRepository } from "../../../../categories/domain/interfaces/ICategoryRepository.js";

export class GetCategoryByIdUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }
}
