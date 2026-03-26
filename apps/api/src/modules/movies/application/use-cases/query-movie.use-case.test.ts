import { describe, expect, it, vi } from "vitest";
import { QueryMovieUseCase } from "./query-movie.use-case";

describe("QueryMovieUseCase", () => {
  it("should parse pagination flags and return paginated response", async () => {
    const movieRepository = {
      listMovies: vi.fn().mockResolvedValue({
        data: [
          {
            toJSONWithRelations: () => ({ id: "m1", title: "Movie 1" }),
          },
        ],
        total: 1,
      }),
    };

    const useCase = new QueryMovieUseCase(movieRepository as any);
    const result = await useCase.execute({
      page: "1",
      limit: "10",
      title: "Movie",
      withCategories: "true",
      withPlatforms: "false",
      withCast: "true",
    } as any);

    expect(movieRepository.listMovies).toHaveBeenCalledWith(
      "Movie",
      undefined,
      undefined,
      true,
      false,
      true,
      { page: 1, limit: 10 }
    );
    expect(result.success).toBe(true);
    expect(result.data.items).toHaveLength(1);
    expect(result.data.pagination.page).toBe(1);
  });
});
