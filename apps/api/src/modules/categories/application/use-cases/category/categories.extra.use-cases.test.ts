// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../../shared/errors/index.js";
import { GetCategoryByIdUseCase } from "./get-category-by-id.use-case.js";
import { ListCategoriesUseCase } from "./list-categories.use-case.js";

describe("categories extra use-cases", () => {
  it("list validates bounds and paginates", async () => {
    const repo = {
      findAll: vi
        .fn()
        .mockResolvedValue({ categories: [{ id: "c1" }], total: 1 }),
    };
    const useCase = new ListCategoriesUseCase(repo as never);
    await expect(useCase.execute({ page: 0, limit: 10 })).rejects.toThrow();
    await expect(useCase.execute({ page: 1, limit: 101 })).rejects.toThrow();
    const res = await useCase.execute({ page: 1, limit: 10 });
    expect(res.categories).toHaveLength(1);
    expect(res.totalPages).toBe(1);
  });

  it("getById returns category or throws", async () => {
    const repo = {
      findById: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "c1" }),
    };
    const useCase = new GetCategoryByIdUseCase(repo as never);
    await expect(useCase.execute("c1")).rejects.toBeInstanceOf(NotFoundError);
    await expect(useCase.execute("c1")).resolves.toEqual({ id: "c1" });
  });
});
