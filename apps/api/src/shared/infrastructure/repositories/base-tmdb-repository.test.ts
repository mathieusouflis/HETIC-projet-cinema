import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BaseTMDBRepository,
  type GetTrailersResult,
  type TMDBDiscoverResponse,
} from "./base-tmdb-repository.js";

type DiscoverRow = { id: number; genre_ids: number[] };

const { MockTmdbService, requestMock } = vi.hoisted(() => {
  const requestMock = vi.fn();
  class MockTmdbService {
    request = requestMock;
  }
  return { MockTmdbService, requestMock };
});

vi.mock("../../services/tmdb/tmdb-service.js", () => ({
  TmdbService: MockTmdbService,
}));

class TestTMDBRepository extends BaseTMDBRepository<
  DiscoverRow,
  { id: number }
> {
  protected readonly discoverEndpoint = "discover/test";
  protected readonly searchEndpoint = "search/test";
  protected readonly detailEndpoint = "detail";
  protected readonly videoEndpoint = "video/{id}/trailers";
  protected readonly contentTypeName = "testcontent";

  override async detail(id: number): Promise<{ id: number }> {
    return { id };
  }
}

describe("BaseTMDBRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getTrailerUrl retourne l URL Youtube pour un Trailer", async () => {
    requestMock.mockResolvedValueOnce({
      results: [
        {
          type: "Trailer",
          key: "abc",
        },
      ],
    } as GetTrailersResult);
    const repo = new TestTMDBRepository();
    await expect(
      (
        repo as unknown as {
          getTrailerUrl: (id: number) => Promise<string | null>;
        }
      ).getTrailerUrl(9)
    ).resolves.toBe("https://www.youtube.com/watch?v=abc");
    expect(requestMock).toHaveBeenCalledWith("GET", "video/9/trailers");
  });

  it("getTrailerUrl retourne null si pas de bande annonce", async () => {
    requestMock.mockResolvedValueOnce({
      results: [],
    } as unknown as GetTrailersResult);
    const repo = new TestTMDBRepository();
    await expect(
      (
        repo as unknown as {
          getTrailerUrl: (id: number) => Promise<string | null>;
        }
      ).getTrailerUrl(1)
    ).resolves.toBeNull();
  });

  it("getTrailerUrl retourne null en cas d erreur API", async () => {
    requestMock.mockRejectedValueOnce(new Error("network"));
    const repo = new TestTMDBRepository();
    await expect(
      (
        repo as unknown as {
          getTrailerUrl: (id: number) => Promise<string | null>;
        }
      ).getTrailerUrl(1)
    ).resolves.toBeNull();
  });

  it("discover retourne ids et total", async () => {
    const payload: TMDBDiscoverResponse<DiscoverRow> = {
      page: 1,
      results: [{ id: 10, genre_ids: [1] }],
      total_pages: 1,
      total_results: 1,
    };
    requestMock.mockResolvedValueOnce(payload);
    const repo = new TestTMDBRepository();
    const out = await repo.discover({ page: 1 });
    expect(out.ids).toEqual([10]);
    expect(out.total).toBe(1);
  });

  it("discover ajoute with_genres quand des categories sont fournies", async () => {
    requestMock.mockResolvedValueOnce({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    });
    const repo = new TestTMDBRepository();
    await repo.discover({ page: 2, withCategories: ["28", "12"] });
    expect(requestMock).toHaveBeenCalledWith("GET", "discover/test", {
      page: "2",
      with_genres: "28,12",
    });
  });

  it("discover propage les erreurs", async () => {
    requestMock.mockRejectedValueOnce(new Error("fail"));
    const repo = new TestTMDBRepository();
    await expect(repo.discover({ page: 1 })).rejects.toThrow("fail");
  });

  it("search filtre par genre quand withCategories est defini", async () => {
    requestMock.mockResolvedValueOnce({
      page: 1,
      results: [
        { id: 1, genre_ids: [10, 20] },
        { id: 2, genre_ids: [99] },
      ],
      total_pages: 1,
      total_results: 2,
    });
    const repo = new TestTMDBRepository();
    const out = await repo.search({
      query: "x",
      page: 1,
      withCategories: ["10"],
    });
    expect(out.ids).toEqual([1]);
    expect(out.results).toHaveLength(1);
  });

  it("search sans filtre conserve tous les resultats", async () => {
    requestMock.mockResolvedValueOnce({
      page: 1,
      results: [{ id: 3, genre_ids: [] }],
      total_pages: 1,
      total_results: 1,
    });
    const repo = new TestTMDBRepository();
    const out = await repo.search({ query: "a", page: 1 });
    expect(out.ids).toEqual([3]);
  });

  it("search propage les erreurs", async () => {
    requestMock.mockRejectedValueOnce(new Error("search fail"));
    const repo = new TestTMDBRepository();
    await expect(repo.search({ query: "a", page: 1 })).rejects.toThrow(
      "search fail"
    );
  });

  it("getMultipleDetails appelle detail pour chaque id", async () => {
    const repo = new TestTMDBRepository();
    const out = await repo.getMultipleDetails([4, 5]);
    expect(out).toEqual([{ id: 4 }, { id: 5 }]);
  });

  it("getMultipleDetails propage les erreurs de detail", async () => {
    const repo = new TestTMDBRepository();
    const spy = vi
      .spyOn(repo, "detail")
      .mockRejectedValueOnce(new Error("detail fail"));
    await expect(repo.getMultipleDetails([1])).rejects.toThrow("detail fail");
    spy.mockRestore();
  });
});
