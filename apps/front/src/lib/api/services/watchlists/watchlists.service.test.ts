// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/api-sdk", () => ({
  pOSTWatchlist: vi.fn(),
  gETWatchlistContentId: vi.fn(),
  gETWatchlist: vi.fn(),
  pUTWatchlistContentId: vi.fn(),
  pUTWatchlistId: vi.fn(),
  dELETEWatchlistContentId: vi.fn(),
  dELETEWatchlistId: vi.fn(),
}));

const invalidateQueriesMock = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((config) => config),
  useMutation: vi.fn((config) => config),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: invalidateQueriesMock,
  })),
}));

vi.mock("@/features/auth/stores/auth.store", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));

import * as sdk from "@packages/api-sdk";
import { queryWatchlistService, watchlistService } from "./index";

describe("watchlistService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls imperative methods", async () => {
    vi.mocked(sdk.pOSTWatchlist).mockResolvedValue({
      data: { ok: 1 },
    } as never);
    vi.mocked(sdk.gETWatchlistContentId).mockResolvedValue({
      data: { ok: 2 },
    } as never);
    vi.mocked(sdk.gETWatchlist).mockResolvedValue({ data: { ok: 3 } } as never);
    vi.mocked(sdk.pUTWatchlistContentId).mockResolvedValue({
      data: { ok: 4 },
    } as never);
    vi.mocked(sdk.pUTWatchlistId).mockResolvedValue({
      data: { ok: 5 },
    } as never);
    vi.mocked(sdk.dELETEWatchlistContentId).mockResolvedValue({} as never);
    vi.mocked(sdk.dELETEWatchlistId).mockResolvedValue({} as never);

    await expect(watchlistService.create({} as never)).resolves.toEqual({
      data: { ok: 1 },
    });
    await expect(watchlistService.getId("c1")).resolves.toEqual({
      data: { ok: 2 },
    });
    await expect(watchlistService.list()).resolves.toEqual({ data: { ok: 3 } });
    await expect(
      watchlistService.updateContentId("c1", {} as never)
    ).resolves.toEqual({
      data: { ok: 4 },
    });
    await expect(watchlistService.updateId("w1", {} as never)).resolves.toEqual(
      {
        data: { ok: 5 },
      }
    );
    await expect(
      watchlistService.deleteContentId("c1")
    ).resolves.toBeUndefined();
    await expect(watchlistService.deleteId("w1")).resolves.toBeUndefined();
  });

  it("builds query hook wrappers", () => {
    const createMutation = queryWatchlistService.create();
    const getQuery = queryWatchlistService.getId("c1");
    const listQuery = queryWatchlistService.list();
    const updateIdMutation = queryWatchlistService.updateId("w1", {} as never);
    const updateContentMutation = queryWatchlistService.updateContentId();
    const deleteContentMutation = queryWatchlistService.deleteContentId();
    const deleteIdMutation = queryWatchlistService.deleteId();

    expect(createMutation.mutationFn).toBeDefined();
    expect(getQuery.enabled).toBe(true);
    expect(listQuery.enabled).toBe(true);
    expect(updateIdMutation.mutationFn).toBeDefined();
    expect(updateContentMutation.mutationFn).toBeDefined();
    expect(deleteContentMutation.mutationFn).toBeDefined();
    expect(deleteIdMutation.mutationFn).toBeDefined();
  });

  it("executes query mutation functions", async () => {
    vi.mocked(sdk.pOSTWatchlist).mockResolvedValue({
      data: { ok: "created" },
    } as never);
    vi.mocked(sdk.pUTWatchlistId).mockResolvedValue({
      data: { ok: "updated" },
    } as never);
    vi.mocked(sdk.pUTWatchlistContentId).mockResolvedValue({
      data: { ok: "updated-content" },
    } as never);
    vi.mocked(sdk.dELETEWatchlistContentId).mockResolvedValue({} as never);
    vi.mocked(sdk.dELETEWatchlistId).mockResolvedValue({} as never);

    const createMutation = queryWatchlistService.create();
    await expect(createMutation.mutationFn({} as never)).resolves.toEqual({
      data: { ok: "created" },
    });
    createMutation.onSuccess?.(undefined, { contentId: "c1" });

    const updateIdMutation = queryWatchlistService.updateId("w1", {} as never);
    await expect(updateIdMutation.mutationFn()).resolves.toEqual({
      data: { ok: "updated" },
    });
    updateIdMutation.onSuccess?.();

    const updateContentMutation = queryWatchlistService.updateContentId();
    await expect(
      updateContentMutation.mutationFn({ id: "c1", data: {} as never })
    ).resolves.toEqual({ data: { ok: "updated-content" } });
    updateContentMutation.onSuccess?.(undefined, {
      id: "c1",
      data: {} as never,
    });

    const deleteContentMutation = queryWatchlistService.deleteContentId();
    await expect(
      deleteContentMutation.mutationFn({ contentId: "c1" })
    ).resolves.toBeUndefined();
    deleteContentMutation.onSuccess?.(undefined, { contentId: "c1" });

    const deleteIdMutation = queryWatchlistService.deleteId();
    await expect(
      deleteIdMutation.mutationFn({ id: "w1" })
    ).resolves.toBeUndefined();
    deleteIdMutation.onSuccess?.();

    expect(invalidateQueriesMock).toHaveBeenCalled();
  });
});
