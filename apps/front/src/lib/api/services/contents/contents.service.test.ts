import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/api-sdk", () => ({
  gETContents: vi.fn(),
  gETContentsId: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((config) => config),
}));

import * as sdk from "@packages/api-sdk";
import { contentService, queryContentService } from "./index";

describe("contentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("discover maps categories and returns data", async () => {
    vi.mocked(sdk.gETContents).mockResolvedValue({
      data: { data: [{ id: "c1" }] },
    } as never);

    const result = await contentService.discover({
      page: 1,
      categories: ["1", "2"],
    } as never);

    expect(sdk.gETContents).toHaveBeenCalledWith({
      page: 1,
      categories: "[1,2]",
    });
    expect(result).toEqual([{ id: "c1" }]);
  });

  it("discover omits categories in the SDK call when the array is empty", async () => {
    vi.mocked(sdk.gETContents).mockResolvedValue({
      data: { data: [] },
    } as never);

    await contentService.discover({ page: 1, categories: [] } as never);

    expect(sdk.gETContents).toHaveBeenCalledWith({ page: 1 });
  });

  it("get returns data and query wrappers call useQuery", async () => {
    vi.mocked(sdk.gETContentsId).mockResolvedValue({
      data: { data: { id: "c2" } },
    } as never);

    await expect(contentService.get("c2")).resolves.toEqual({ id: "c2" });
    queryContentService.discover({ page: 1 } as never);
    queryContentService.get("c2");

    expect(queryContentService.discover({ page: 1 } as never)).toBeDefined();
  });
});
