// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/api-sdk", () => ({
  gETPeoplesSearch: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((config) => config),
}));

import * as sdk from "@packages/api-sdk";
import { peoplesService, queryPeoplesService } from "./index";

describe("peoplesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("search calls sdk and returns data", async () => {
    vi.mocked(sdk.gETPeoplesSearch).mockResolvedValue({
      data: { data: [{ id: "p1" }] },
    } as never);

    await expect(
      peoplesService.search({ query: "john" } as never)
    ).resolves.toEqual([{ id: "p1" }]);
  });

  it("query wrapper sets enabled by non-empty query", () => {
    const withQuery = queryPeoplesService.search({ query: "a" } as never);
    const empty = queryPeoplesService.search({ query: "  " } as never);

    expect(withQuery.enabled).toBe(true);
    expect(empty.enabled).toBe(false);
  });
});
