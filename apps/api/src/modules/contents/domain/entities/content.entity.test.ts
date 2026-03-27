// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import { Content } from "./content.entity.js";

describe("Content entity", () => {
  const baseRow = {
    id: "c1",
    type: "movie",
    title: "Inception",
    originalTitle: "Inception Original",
    slug: "inception",
    synopsis: "Dreams",
    posterUrl: "poster.jpg",
    backdropUrl: "backdrop.jpg",
    trailerUrl: "trailer.mp4",
    releaseDate: "2010-07-16",
    year: 2010,
    durationMinutes: 148,
    tmdbId: 27205,
    averageRating: "8.5",
    totalRatings: 100,
    totalViews: 5000,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  };

  it("expose les proprietes et convertit les types", () => {
    const content = new Content(baseRow);

    expect(content.releaseDate).toBeInstanceOf(Date);
    expect(content.createdAt).toBeInstanceOf(Date);
    expect(content.updatedAt).toBeInstanceOf(Date);
    expect(content.averageRating).toBe(8.5);
  });

  it("detecte type, medias et ids externes", () => {
    const movie = new Content(baseRow);
    const serie = new Content({ ...baseRow, type: "serie", tmdbId: null });

    expect(movie.isMovie()).toBe(true);
    expect(movie.isSeries()).toBe(false);
    expect(movie.hasPoster()).toBe(true);
    expect(movie.hasBackdrop()).toBe(true);
    expect(movie.hasTrailer()).toBe(true);
    expect(movie.hasExternalIds()).toBe(true);
    expect(serie.isSeries()).toBe(true);
    expect(serie.hasExternalIds()).toBe(false);
  });

  it("retourne false quand les champs medias sont vides", () => {
    const content = new Content({
      ...baseRow,
      posterUrl: "",
      backdropUrl: "",
      trailerUrl: "",
      releaseDate: null,
    });

    expect(content.hasPoster()).toBe(false);
    expect(content.hasBackdrop()).toBe(false);
    expect(content.hasTrailer()).toBe(false);
    expect(content.hasReleaseDate()).toBe(false);
  });

  it("formate correctement display title et duree", () => {
    const withOriginal = new Content(baseRow);
    const withoutOriginal = new Content({ ...baseRow, originalTitle: "" });
    const shortMovie = new Content({ ...baseRow, durationMinutes: 45 });
    const roundHour = new Content({ ...baseRow, durationMinutes: 120 });
    const invalidDuration = new Content({ ...baseRow, durationMinutes: 0 });

    expect(withOriginal.getDisplayTitle()).toBe(
      "Inception (Inception Original)"
    );
    expect(withoutOriginal.getDisplayTitle()).toBe("Inception");
    expect(shortMovie.getFormattedDuration()).toBe("45m");
    expect(roundHour.getFormattedDuration()).toBe("2h");
    expect(invalidDuration.getFormattedDuration()).toBeNull();
  });

  it("gere rating, popularite et age", () => {
    const high = new Content(baseRow);
    const low = new Content({
      ...baseRow,
      averageRating: "0",
      totalViews: 10,
      year: null,
    });

    expect(high.hasRating()).toBe(true);
    expect(high.isHighlyRated()).toBe(true);
    expect(high.isPopular()).toBe(true);
    expect(high.getRatingInfo()).toEqual({
      average: 8.5,
      total: 100,
      formatted: "8.50",
    });
    expect(typeof high.getAgeInYears()).toBe("number");

    expect(low.hasRating()).toBe(false);
    expect(low.isHighlyRated()).toBe(false);
    expect(low.isPopular()).toBe(false);
    expect(low.getAgeInYears()).toBeNull();
  });

  it("serialize avec relations", () => {
    const content = new Content(baseRow);
    const category = { toJSON: vi.fn(() => ({ id: "cat1" })) } as never;
    content.setRelations("contentCategories", [category]);

    const json = content.toJSON();
    const withRelations = content.toJSONWithRelations();
    const filtered = content.toJSONWithRelations({ contentCategories: true });

    expect(json.id).toBe("c1");
    expect(withRelations.contentCategories).toEqual([{ id: "cat1" }]);
    expect(filtered.contentCategories).toEqual([{ id: "cat1" }]);
  });
});
