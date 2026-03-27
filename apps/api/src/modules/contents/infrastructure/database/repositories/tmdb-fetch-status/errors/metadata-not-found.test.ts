import { describe, expect, it } from "vitest";
import { MetadataNotFoundError } from "./metadata-not-found";

describe("MetadataNotFoundError", () => {
  it("builds a not found message with path", () => {
    const err = new MetadataNotFoundError("/foo/bar");
    expect(err.message).toContain("/foo/bar");
    expect(err.name).toBe("MetadataNotFoundError");
  });
});
