import { describe, expect, it } from "vitest";
import { PaginationService } from "./pagination.service.js";

describe("PaginationService", () => {
  it("should expose default config", () => {
    const service = new PaginationService();

    expect(service.getConfig()).toEqual({
      defaultPage: 1,
      defaultLimit: 25,
      maxLimit: 100,
      defaultOffset: 0,
    });
  });

  it("parsePageParams should normalize page/limit and compute skip", () => {
    const service = new PaginationService({ defaultLimit: 10, maxLimit: 50 });

    expect(service.parsePageParams({ page: 3, limit: 20 })).toEqual({
      page: 3,
      limit: 20,
      skip: 40,
    });

    expect(service.parsePageParams({ page: 0, limit: 999 })).toEqual({
      page: 1,
      limit: 50,
      skip: 0,
    });
  });

  it("parseOffsetParams should normalize offset and limit", () => {
    const service = new PaginationService({
      defaultOffset: 5,
      defaultLimit: 10,
    });

    expect(service.parseOffsetParams({ offset: -10, limit: 200 })).toEqual({
      offset: 0,
      limit: 100,
    });

    expect(service.parseOffsetParams({})).toEqual({
      offset: 5,
      limit: 10,
    });
  });

  it("parseFlexibleParams should detect page-based mode", () => {
    const service = new PaginationService();

    expect(service.parseFlexibleParams({ page: 2, limit: 10 })).toEqual({
      page: 2,
      limit: 10,
      skip: 10,
      offset: 10,
      usesPageBased: true,
    });
  });

  it("parseFlexibleParams should fallback to offset-based mode", () => {
    const service = new PaginationService();

    expect(service.parseFlexibleParams({ offset: 20, limit: 10 })).toEqual({
      page: 3,
      limit: 10,
      skip: 20,
      offset: 20,
      usesPageBased: false,
    });
  });

  it("createPageResult and createPageResultWithMapper should return paginated shape", () => {
    const service = new PaginationService();

    const base = service.createPageResult(["a", "b"], 2, 2, 5);
    const mapped = service.createPageResultWithMapper(
      [{ id: 1 }, { id: 2 }],
      (item) => item.id * 10,
      1,
      2,
      2
    );

    expect(base).toEqual({
      items: ["a", "b"],
      pagination: {
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
    expect(mapped.items).toEqual([10, 20]);
    expect(mapped.pagination.totalPages).toBe(1);
  });

  it("createOffsetResult and createOffsetResultWithMapper should return offset shape", () => {
    const service = new PaginationService();

    const base = service.createOffsetResult(["x"], 10, 5, 17);
    const mapped = service.createOffsetResultWithMapper(
      [{ id: "1" }],
      (item) => Number(item.id),
      0,
      1,
      1
    );

    expect(base).toEqual({
      items: ["x"],
      pagination: {
        offset: 10,
        limit: 5,
        total: 17,
        hasMore: true,
      },
    });
    expect(mapped).toEqual({
      items: [1],
      pagination: {
        offset: 0,
        limit: 1,
        total: 1,
        hasMore: false,
      },
    });
  });

  it("calculatePageMeta and calculateOffsetMeta should compute navigation flags", () => {
    const service = new PaginationService();

    expect(service.calculatePageMeta(1, 10, 0)).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    expect(service.calculateOffsetMeta(30, 10, 35)).toEqual({
      offset: 30,
      limit: 10,
      total: 35,
      hasMore: false,
    });
  });

  it("skip/page/offset conversion helpers should be consistent", () => {
    const service = new PaginationService();

    expect(service.calculateSkip(3, 10)).toBe(20);
    expect(service.pageToOffset(3, 10)).toBe(20);
    expect(service.offsetToPage(20, 10)).toBe(3);
  });

  it("isValidPage should handle empty and non-empty totals", () => {
    const service = new PaginationService();

    expect(service.isValidPage(1, 10, 0)).toBe(true);
    expect(service.isValidPage(2, 10, 0)).toBe(false);
    expect(service.isValidPage(0, 10, 100)).toBe(false);
    expect(service.isValidPage(5, 10, 45)).toBe(true);
    expect(service.isValidPage(6, 10, 45)).toBe(false);
  });

  it("range helpers should compute and format range properly", () => {
    const service = new PaginationService();

    expect(service.getPaginationRange(2, 10, 45)).toEqual({
      start: 11,
      end: 20,
      total: 45,
    });
    expect(service.getPaginationRange(1, 10, 0)).toEqual({
      start: 0,
      end: 0,
      total: 0,
    });
    expect(service.formatPaginationRange(2, 10, 45)).toBe("11-20 of 45");
    expect(service.formatPaginationRange(1, 10, 0)).toBe("0 of 0");
  });

  it("safe helpers should clamp values to configured bounds", () => {
    const service = new PaginationService({
      defaultPage: 2,
      defaultLimit: 15,
      maxLimit: 30,
      defaultOffset: 4,
    });

    expect(service.getSafePage(undefined)).toBe(2);
    expect(service.getSafePage(0)).toBe(1);
    expect(service.getSafeLimit(undefined)).toBe(15);
    expect(service.getSafeLimit(1000)).toBe(30);
    expect(service.getSafeLimit(0)).toBe(1);
    expect(service.getSafeOffset(undefined)).toBe(4);
    expect(service.getSafeOffset(-5)).toBe(0);
  });
});
