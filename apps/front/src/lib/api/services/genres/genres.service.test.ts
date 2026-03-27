import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/api-sdk", () => ({
  gETCategories: vi.fn(),
}));

import * as sdk from "@packages/api-sdk";
import { categorieService } from "./index";

describe("categorieService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls gETCategories and returns payload data", async () => {
    vi.mocked(sdk.gETCategories).mockResolvedValue({
      data: { data: [{ id: "cat-1" }] },
    } as never);

    const result = await categorieService.list({ page: 1 } as never);

    expect(sdk.gETCategories).toHaveBeenCalledWith({ page: 1 });
    expect(result).toEqual([{ id: "cat-1" }]);
  });
});
