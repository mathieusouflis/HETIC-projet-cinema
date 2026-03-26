import { describe, expect, it } from "vitest";
import { initializeZodOpenAPI, z } from "./zod-openapi";

describe("ZodOpenAPI", () => {
  it("should initialize extension without throwing", () => {
    expect(() => initializeZodOpenAPI()).not.toThrow();
  });

  it("should expose zod instance with openapi extension already applied", () => {
    const schema = z.string();

    expect(typeof schema.openapi).toBe("function");
    expect(() =>
      schema.openapi({
        example: "movie-title",
      })
    ).not.toThrow();
  });

  it("initializeZodOpenAPI should be idempotent", () => {
    expect(() => {
      initializeZodOpenAPI();
      initializeZodOpenAPI();
      initializeZodOpenAPI();
    }).not.toThrow();
  });
});
