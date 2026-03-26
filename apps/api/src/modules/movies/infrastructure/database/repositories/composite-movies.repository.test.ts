import { describe, expect, it, vi } from "vitest";
import { CompositeMoviesRepository } from "./composite-movies.repository";

describe("CompositeMoviesRepository", () => {
  it("listMovies should delegate to baseList with movie flags", async () => {
    const repo = new CompositeMoviesRepository();
    const baseListSpy = vi
      .spyOn(repo as any, "baseList")
      .mockResolvedValue({ data: [], total: 0 });

    const result = await repo.listMovies(
      "title",
      "FR",
      ["1"],
      true,
      true,
      false,
      { page: 2, limit: 20 } as any
    );

    expect(baseListSpy).toHaveBeenCalledWith(
      "title",
      "FR",
      ["1"],
      true,
      true,
      false,
      false,
      false,
      { page: 2, limit: 20 }
    );
    expect(result).toEqual({ data: [], total: 0 });
  });

  it("searchMovies should delegate to baseSearch", async () => {
    const repo = new CompositeMoviesRepository();
    const baseSearchSpy = vi
      .spyOn(repo as any, "baseSearch")
      .mockResolvedValue([{ id: "m1" }]);

    const result = await repo.searchMovies("batman", { page: 1 } as any);

    expect(baseSearchSpy).toHaveBeenCalledWith("batman", { page: 1 });
    expect(result).toEqual([{ id: "m1" }]);
  });

  it("getMovieById should return null when drizzle returns null", async () => {
    const repo = new CompositeMoviesRepository();
    const drizzle = (repo as any).drizzleRepository;
    vi.spyOn(drizzle, "getById").mockResolvedValue(null);

    const result = await repo.getMovieById("missing");

    expect(result).toBeNull();
  });

  it("create/update/delete/getCount should delegate to drizzle repository", async () => {
    const repo = new CompositeMoviesRepository();
    const drizzle = (repo as any).drizzleRepository;

    vi.spyOn(drizzle, "create").mockResolvedValue({ id: "m1" });
    vi.spyOn(drizzle, "update").mockResolvedValue({ id: "m1", title: "new" });
    vi.spyOn(drizzle, "delete").mockResolvedValue(undefined);
    vi.spyOn(drizzle, "getCount").mockResolvedValue(3);

    const created = await repo.createMovie({
      type: "movie",
      title: "x",
    } as any);
    const updated = await repo.updateMovie("m1", { title: "new" } as any);
    await repo.deleteMovie("m1");
    const count = await repo.getMovieCount("x");

    expect(created).toEqual({ id: "m1" });
    expect(updated).toEqual({ id: "m1", title: "new" });
    expect(count).toBe(3);
  });
});
