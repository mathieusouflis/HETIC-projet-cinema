import { describe, expect, it } from "vitest";
import { queryContentRequestSchema } from "./query-contents.validator";

describe("query-contents.validator", () => {
  it("parses bracket categories format", () => {
    const parsed = queryContentRequestSchema.parse({
      categories: "[12,15]",
      withCategory: "true",
      limit: 10,
    });

    expect(parsed.categories).toEqual(["12", "15"]);
  });

  it("rejects invalid category relation flags", () => {
    expect(() =>
      queryContentRequestSchema.parse({
        withCategory: "yes",
      })
    ).toThrow();
  });
});
