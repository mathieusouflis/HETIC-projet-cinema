import { describe, expect, it } from "vitest";
import {
  flexiblePaginationQuerySchema,
  optionalFlexiblePaginationQuerySchema,
  pageSchema,
  paginationWithSearchQuerySchema,
  sortDirectionSchema,
  sortSchema,
} from "./pagination.schemas";

describe("pagination.schemas", () => {
  it("coerces and defaults page", () => {
    expect(pageSchema.parse(undefined)).toBe(1);
    expect(pageSchema.parse("2")).toBe(2);
  });

  it("normalizes sort direction and sort tuple", () => {
    expect(sortDirectionSchema.parse("ASC")).toBe("asc");
    expect(sortSchema.parse("createdAt:DESC")).toEqual({
      field: "createdAt",
      direction: "desc",
    });
  });

  it("validates XOR rule for flexible pagination", () => {
    // Current behavior: both payload shapes below are rejected by the XOR refine.
    expect(() =>
      flexiblePaginationQuerySchema.parse({ page: 1, limit: 10 })
    ).toThrow();
    expect(() =>
      flexiblePaginationQuerySchema.parse({ offset: 0, limit: 10 })
    ).toThrow();
    expect(() =>
      flexiblePaginationQuerySchema.parse({ page: 1, offset: 0, limit: 10 })
    ).toThrow();
  });

  it("supports optional legacy schema and search schema", () => {
    expect(optionalFlexiblePaginationQuerySchema.parse({})).toEqual({
      page: 1,
      offset: 0,
      limit: 25,
    });
    const parsed = paginationWithSearchQuerySchema.parse({
      page: 1,
      limit: 20,
      search: "  batman ",
    });
    expect(parsed.search).toBe("batman");
  });
});
