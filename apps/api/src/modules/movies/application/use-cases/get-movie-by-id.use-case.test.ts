import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/errors/not-found-error";
import { GetMovieByIdUseCase } from "./get-movie-by-id.use-case";

describe("GetMovieByIdUseCase", () => {
  it("should return movie json when movie exists", async () => {
    const movieRepository = {
      getMovieById: vi.fn().mockResolvedValue({
        toJSON: () => ({ id: "m1", title: "Movie 1" }),
      }),
    };
    const useCase = new GetMovieByIdUseCase(movieRepository as any);

    const result = await useCase.execute("m1", { withCategories: true });

    expect(movieRepository.getMovieById).toHaveBeenCalledWith("m1", {
      withCategories: true,
    });
    expect(result).toEqual({ id: "m1", title: "Movie 1" });
  });

  it("should throw NotFoundError when movie does not exist", async () => {
    const movieRepository = {
      getMovieById: vi.fn().mockResolvedValue(null),
    };
    const useCase = new GetMovieByIdUseCase(movieRepository as any);

    await expect(useCase.execute("missing", {})).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
