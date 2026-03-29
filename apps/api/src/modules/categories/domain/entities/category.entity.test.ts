import { describe, expect, it } from "vitest";
import { Category } from "./category.entity.js";

describe("Category entity", () => {
  const baseRow = {
    id: "cat-1",
    name: "Science Fiction",
    slug: "science-fiction",
    tmdbId: 878,
    description: "Futuristic stories",
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  it("construit l'entite et expose toJSON", () => {
    const category = new Category(baseRow);
    const json = category.toJSON();

    expect(category.createdAt).toBeInstanceOf(Date);
    expect(json.id).toBe("cat-1");
    expect(json.name).toBe("Science Fiction");
  });

  it("hasDescription et generateSlug couvrent les branches", () => {
    const withDescription = new Category(baseRow);
    const withoutDescription = new Category({ ...baseRow, description: "" });

    expect(withDescription.hasDescription()).toBe(true);
    expect(withoutDescription.hasDescription()).toBe(false);
    expect(Category.generateSlug("  Action & Adventure  ")).toBe(
      "action-adventure"
    );
  });
});
