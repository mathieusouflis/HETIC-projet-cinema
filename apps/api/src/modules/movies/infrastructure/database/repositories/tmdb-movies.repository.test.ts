import { describe, expect, it, vi } from "vitest";
import { TMDBMoviesRepository } from "./tmdb-movies.repository";

describe("TMDBMoviesRepository", () => {
  it("detail should map TMDB payload to movie props", async () => {
    const repo = new TMDBMoviesRepository();

    vi.spyOn(repo as any, "getTrailerUrl").mockResolvedValue(
      "https://youtube/test"
    );
    const request = vi.fn();
    (repo as any).tmdbService = { request };

    request
      .mockResolvedValueOnce({
        id: 42,
        title: "My Movie",
        original_title: "My Movie Original",
        overview: "Synopsis",
        poster_path: "/poster.jpg",
        backdrop_path: "/bg.jpg",
        release_date: "2024-01-01",
        vote_average: 7.5,
        vote_count: 100,
        runtime: 120,
        genres: [{ id: 1, name: "Action" }],
      })
      .mockResolvedValueOnce({
        results: {
          FR: { flatrate: [{ provider_id: 8, provider_name: "Netflix" }] },
        },
      })
      .mockResolvedValueOnce({
        cast: [
          {
            id: 10,
            known_for_department: "Acting",
            name: "Actor",
            original_name: "Actor",
            cast_id: 10,
            character: "Hero",
            order: 0,
          },
        ],
      });

    const result = await repo.detail(42);

    expect(result.tmdbId).toBe(42);
    expect(result.type).toBe("movie");
    expect(result.title).toBe("My Movie");
    expect(result.trailerUrl).toBe("https://youtube/test");
    expect(result.providers?.[0]?.provider_id).toBe(8);
    expect(result.cast?.[0]?.id).toBe(10);
  });
});
