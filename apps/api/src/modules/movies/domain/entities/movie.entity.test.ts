// @ts-nocheck
import { describe, expect, it } from "vitest";
import { Movie } from "./movie.entity.js";

describe("Movie entity", () => {
  const baseRow = {
    id: "m1",
    type: "movie",
    title: "Inception",
    originalTitle: "Inception",
    slug: "inception",
    synopsis: "Dreams inside dreams",
    posterUrl: "https://img.test/inception-poster.jpg",
    backdropUrl: "https://img.test/inception-bg.jpg",
    trailerUrl: "https://video.test/inception",
    releaseDate: "2010-07-16",
    year: 2010,
    durationMinutes: 148,
    tmdbId: 27205,
    averageRating: "8.8",
    totalRatings: 1000,
    totalViews: 5000,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  it("retourne les bons flags de type", () => {
    const movie = new Movie(baseRow);

    expect(movie.isMovie()).toBe(true);
    expect(movie.isSeries()).toBe(false);
  });

  it("toJSON force type=movie", () => {
    const movie = new Movie({ ...baseRow, type: "serie" });
    const json = movie.toJSON();

    expect(json.type).toBe("movie");
    expect(json.title).toBe("Inception");
  });

  it("toJSONWithRelations preserve type=movie", () => {
    const movie = new Movie(baseRow);
    movie.setRelations("contentCategories", [{ toJSON: () => ({ id: "c1" }) }]);

    const json = movie.toJSONWithRelations();
    expect(json.type).toBe("movie");
    expect(Array.isArray(json.contentCategories)).toBe(true);
  });
});
