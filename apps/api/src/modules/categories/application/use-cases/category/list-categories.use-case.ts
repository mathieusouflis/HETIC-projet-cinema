import type { Category } from "../../../../categories/domain/entities/category.entity.js";
import type { ICategoryRepository } from "../../../../categories/domain/interfaces/ICategoryRepository.js";

export interface ListCategoriesOptions {
  page: number;
  limit: number;
}

export interface ListCategoriesResult {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(options: ListCategoriesOptions): Promise<ListCategoriesResult> {
    const { page = 1, limit = 10 } = options;

    if (page < 1) {
      throw new Error("Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    const result = await this.categoryRepository.findAll({
      page,
      limit,
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      categories: result.categories,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }
}
