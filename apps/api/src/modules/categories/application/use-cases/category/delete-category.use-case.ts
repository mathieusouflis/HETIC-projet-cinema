import { NotFoundError } from "../../../../../shared/errors/index.js";
import type { ICategoryRepository } from "../../../domain/interfaces/ICategoryRepository.js";

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    await this.categoryRepository.delete(id);
  }
}
