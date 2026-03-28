import { describe, expect, it } from "vitest";
import { platformValidator } from "./platforms.validator.js";

describe("platformValidator", () => {
  it("accepte une entree valide", () => {
    const out = platformValidator.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Netflix",
      slug: "netflix",
      logoUrl: "https://example.com/logo.png",
      baseUrl: "https://netflix.com",
      isSupported: true,
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    expect(out.name).toBe("Netflix");
  });

  it("rejette un slug invalide", () => {
    expect(() =>
      platformValidator.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "X",
        slug: "Bad_Slug",
        logoUrl: null,
        baseUrl: null,
        isSupported: null,
        createdAt: null,
      })
    ).toThrow();
  });
});
