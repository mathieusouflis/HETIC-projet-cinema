// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { GetSerieByIdUseCase } from "./get-serie-by-id.use-case.js";
import { QuerySerieUseCase } from "./query-serie.use-case.js";

describe("series use-cases", () => {
  it("getSerieById throws or maps to json", async () => {
    const repo = { getSerieById: vi.fn() };
    const useCase = new GetSerieByIdUseCase(repo as never);
    repo.getSerieById.mockResolvedValueOnce(undefined);
    await expect(useCase.execute("s1")).rejects.toBeInstanceOf(NotFoundError);
    repo.getSerieById.mockResolvedValueOnce({
      toJSON: () => ({ id: "s1" }),
    });
    await expect(useCase.execute("s1")).resolves.toEqual({ id: "s1" });
  });

  it("querySerie maps list with relation flags", async () => {
    const repo = {
      listSeries: vi.fn().mockResolvedValue({
        data: [{ toJSONWithRelations: () => ({ id: "s1" }) }],
        total: 1,
      }),
    };
    const useCase = new QuerySerieUseCase(repo as never);
    const result = await useCase.execute({
      page: 1,
      limit: 10,
      withCategories: "true",
      withPlatforms: "false",
      withCast: "false",
      withSeasons: "false",
      withEpisodes: "false",
    } as never);
    expect(result.data.items).toHaveLength(1);
    expect(repo.listSeries).toHaveBeenCalled();
  });
});
