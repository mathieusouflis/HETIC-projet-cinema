import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServerError } from "../../errors/server-error";
import { TmdbService } from "./tmdb-service";

describe("TmdbService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed json when request succeeds", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ results: [1, 2] }),
    } as never);
    const service = new TmdbService("fr_FR", 3);

    const result = await service.request<{ results: number[] }>(
      "GET",
      "movie/popular",
      { page: "1" }
    );

    expect(result).toEqual({ results: [1, 2] });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("throws ServerError with response details when status is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: vi.fn().mockResolvedValue("bad token"),
    } as never);
    const service = new TmdbService();

    await expect(
      service.request("GET", "movie/popular")
    ).rejects.toBeInstanceOf(ServerError);
  });

  it("wraps unknown errors in ServerError", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    const service = new TmdbService();

    await expect(
      service.request("GET", "movie/popular")
    ).rejects.toBeInstanceOf(ServerError);
  });
});
