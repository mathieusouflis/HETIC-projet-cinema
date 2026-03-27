import { describe, expect, it } from "vitest";
import { episodeValidator, parseEpisode } from "./episode.validator";

describe("episode.validator", () => {
  it("parses valid episode payload", () => {
    const parsed = parseEpisode({
      id: "e1",
      name: "Pilot",
      seasonId: "s1",
      episodeNumber: 1,
      overview: null,
      stillUrl: null,
      airDate: "2024-01-01",
      durationMinutes: 45,
      tmdbId: 1001,
    });

    expect(parsed.name).toBe("Pilot");
    expect(parsed.episodeNumber).toBe(1);
  });

  it("rejects invalid episode payload", () => {
    expect(() =>
      episodeValidator.parse({
        id: "e1",
        name: "",
        seasonId: "s1",
        episodeNumber: -1,
      })
    ).toThrow();
  });
});
