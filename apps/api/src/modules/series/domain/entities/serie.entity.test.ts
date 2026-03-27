// @ts-nocheck
import { describe, expect, it } from "vitest";
import { Serie } from "./serie.entity.js";

describe("Serie entity", () => {
  const baseRow = {
    id: "s1",
    type: "serie",
    title: "Dark",
    originalTitle: "Dark Original",
    slug: "dark",
    synopsis: "Time travel",
    posterUrl: "poster.jpg",
    backdropUrl: "backdrop.jpg",
    trailerUrl: "trailer.mp4",
    releaseDate: "2017-12-01",
    year: 2017,
    durationMinutes: 50,
    tmdbId: 70523,
    averageRating: "8.7",
    totalRatings: 200,
    totalViews: 1000,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  it("retourne les bons flags de type", () => {
    const serie = new Serie(baseRow);
    expect(serie.isMovie()).toBe(false);
    expect(serie.isSeries()).toBe(true);
  });

  it("toJSON et toJSONWithRelations fixent type=serie", () => {
    const serie = new Serie({ ...baseRow, type: "movie" });
    const json = serie.toJSON();
    const withRelations = serie.toJSONWithRelations();

    expect(json.type).toBe("serie");
    expect(withRelations.type).toBe("serie");
  });
});
