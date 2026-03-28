import { beforeEach, describe, expect, it, vi } from "vitest";
import { TmdbService } from "../../../../shared/services/tmdb/tmdb-service";
import { SeasonTmdbRepository } from "./seasons.tmdb.repository";

describe("SeasonTmdbRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("delegates getSeason to tmdb service", async () => {
    vi.spyOn(TmdbService.prototype, "request").mockResolvedValue({
      id: 1,
    } as never);
    const repo = new SeasonTmdbRepository();

    await expect(repo.getSeason(10, 2)).resolves.toEqual({ id: 1 });
  });

  it("collects seasons and skips failing ones", async () => {
    const request = vi
      .spyOn(TmdbService.prototype, "request")
      .mockResolvedValueOnce({ id: 1 } as never)
      .mockRejectedValueOnce(new Error("missing"))
      .mockResolvedValueOnce({ id: 3 } as never);
    const repo = new SeasonTmdbRepository();

    const seasons = await repo.getAllSeasons(20, [1, 2, 3]);
    expect(seasons).toEqual([{ id: 1 }, { id: 3 }]);
    expect(request).toHaveBeenCalledTimes(3);
  });
});
