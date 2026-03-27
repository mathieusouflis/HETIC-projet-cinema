// @ts-nocheck
import { describe, expect, it } from "vitest";
import { Episode } from "./episode.entity.js";

describe("Episode entity", () => {
  const baseRow = {
    id: "e1",
    name: "Pilot",
    seasonId: "season-1",
    episodeNumber: 1,
    overview: "Intro",
    stillUrl: "still.jpg",
    airDate: "2020-01-01",
    durationMinutes: 48,
    tmdbId: 11,
  };

  it("isOut retourne true pour un episode passe", () => {
    const episode = new Episode(baseRow);
    expect(episode.isOut()).toBe(true);
  });

  it("isOut retourne false sans airDate ou date future", () => {
    const noDate = new Episode({ ...baseRow, airDate: null });
    const future = new Episode({ ...baseRow, airDate: "2999-01-01" });
    expect(noDate.isOut()).toBe(false);
    expect(future.isOut()).toBe(false);
  });

  it("toJSON retourne un objet serialisable", () => {
    const episode = new Episode(baseRow);
    expect(episode.toJSON()).toEqual(baseRow);
  });
});
