import { NotFoundError } from "../../../../../shared/errors/not-found-error";
import type { Category } from "../../../../categories/domain/entities/category.entity";
import type { ICategoryRepository } from "../../../../categories/domain/interfaces/ICategoryRepository";

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
