// @ts-nocheck
import { describe, expect, it } from "vitest";
import { Platform } from "./platforms.entity.js";

describe("Platform entity", () => {
  const baseRow = {
    id: "pl1",
    name: "Netflix",
    slug: "netflix",
    logoUrl: "https://img.test/netflix.png",
    baseUrl: "https://netflix.com",
    tmdbId: 8,
    isSupported: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  it("hasLogo retourne true/false selon logoUrl", () => {
    const withLogo = new Platform(baseRow);
    const withoutLogo = new Platform({ ...baseRow, logoUrl: null });

    expect(withLogo.hasLogo()).toBe(true);
    expect(withoutLogo.hasLogo()).toBe(false);
  });

  it("isPlatformSupported utilise false par defaut si null", () => {
    const supported = new Platform(baseRow);
    const unknown = new Platform({ ...baseRow, isSupported: null });

    expect(supported.isPlatformSupported()).toBe(true);
    expect(unknown.isPlatformSupported()).toBe(false);
  });

  it("toJSON expose toutes les proprietes principales", () => {
    const platform = new Platform(baseRow);
    const json = platform.toJSON();

    expect(json.id).toBe("pl1");
    expect(json.name).toBe("Netflix");
    expect(json.slug).toBe("netflix");
    expect(json.createdAt).toBeInstanceOf(Date);
  });
});
