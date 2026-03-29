import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { GetContentByIdUseCase } from "./get-content-by-id.use-case.js";
import { QueryContentUseCase } from "./query-content.use-case.js";

describe("contents use-cases", () => {
  it("getContentById throws when not found and maps json", async () => {
    const repo = { getContentById: vi.fn() };
    const useCase = new GetContentByIdUseCase(repo as never);
    repo.getContentById.mockResolvedValueOnce(undefined);
    await expect(useCase.execute({ id: "x" } as never)).rejects.toBeInstanceOf(
      NotFoundError
    );
    repo.getContentById.mockResolvedValueOnce({
      toJSONWithRelations: () => ({ id: "c1" }),
    });
    await expect(useCase.execute({ id: "c1" } as never)).resolves.toEqual({
      id: "c1",
    });
  });

  it("queryContent builds relation flags and paginates", async () => {
    const repo = {
      listContents: vi.fn().mockResolvedValue({
        data: [{ toJSONWithRelations: () => ({ id: "c1" }) }],
        total: 1,
      }),
    };
    const useCase = new QueryContentUseCase(repo as never);
    const result = await useCase.execute({
      page: 1,
      limit: 10,
      withCategory: "true",
      withPlatform: "true",
      withCast: "false",
      withSeasons: "false",
      withEpisodes: "false",
    } as never);
    expect(result.data.items).toHaveLength(1);
    expect(repo.listContents).toHaveBeenCalled();
  });
});
