import { describe, expect, it } from "vitest";
import { Season } from "./seasons.entity.js";

describe("Season entity", () => {
  const baseRow = {
    id: "season-1",
    seriesId: "serie-1",
    name: "Season 1",
    seasonNumber: 1,
    episodeCount: 10,
    overview: "Overview",
    posterUrl: "poster.jpg",
    airDate: "2020-01-01",
    tmdbId: 101,
  };

  it("hasPoster retourne true/false selon posterUrl", () => {
    const withPoster = new Season(baseRow);
    const withoutPoster = new Season({ ...baseRow, posterUrl: null });

    expect(withPoster.hasPoster()).toBe(true);
    expect(withoutPoster.hasPoster()).toBe(false);
  });

  it("isOut retourne true pour une date passee et false sinon", () => {
    const past = new Season(baseRow);
    const future = new Season({ ...baseRow, airDate: "2999-01-01" });
    const noDate = new Season({ ...baseRow, airDate: null });

    expect(past.isOut()).toBe(true);
    expect(future.isOut()).toBe(false);
    expect(noDate.isOut()).toBe(false);
  });

  it("toJSON retourne les champs attendus", () => {
    const season = new Season(baseRow);
    expect(season.toJSON()).toEqual(baseRow);
  });
});
