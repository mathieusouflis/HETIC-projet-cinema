import { describe, expect, it } from "vitest";
import { CacheManager } from "./composite-repository-types";

describe("CacheManager", () => {
  it("clears cache and returns cache size", () => {
    const cache = new Map<number, string>([
      [1, "a"],
      [2, "b"],
    ]);
    expect(CacheManager.getCacheSize(cache)).toBe(2);
    CacheManager.clearCache(cache);
    expect(CacheManager.getCacheSize(cache)).toBe(0);
  });

  it("generates URL-friendly slugs", () => {
    expect(CacheManager.generateSlug("  Hello, World!  ")).toBe("hello-world");
    expect(CacheManager.generateSlug("A__B--C")).toBe("a-b-c");
  });
});
