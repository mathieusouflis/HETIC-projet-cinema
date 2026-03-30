// @ts-nocheck
import { vi } from "vitest";

const { invalidateQueriesMock, useQueryMock, useMutationMock } = vi.hoisted(
  () => {
    const invalidateQueriesMock = vi.fn();

    const useQueryMock = vi.fn((config: any) => ({
      ...config,
      isEnabled: config.enabled ?? true,
    }));

    const useMutationMock = vi.fn((config: any) => {
      const mutate = vi.fn(async (variables?: unknown) => {
        const result = await config.mutationFn(variables as never);
        await config.onSuccess?.(
          result,
          variables as never,
          undefined as never
        );
        return result;
      });

      return {
        ...config,
        mutate,
        mutateAsync: mutate,
        onSuccess: config.onSuccess,
      };
    });

    return { invalidateQueriesMock, useQueryMock, useMutationMock };
  }
);

vi.mock("@packages/api-sdk", () => ({
  pOSTWatchlist: vi.fn(),
  gETWatchlistContentId: vi.fn(),
  gETWatchlist: vi.fn(),
  pUTWatchlistContentId: vi.fn(),
  pUTWatchlistId: vi.fn(),
  dELETEWatchlistContentId: vi.fn(),
  dELETEWatchlistId: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
  useMutation: useMutationMock,
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

    expect(createMutation.mutate).toBeDefined();
    expect(getQuery.isEnabled).toBe(true);
    expect(listQuery.isEnabled).toBe(true);
    expect(updateIdMutation.mutate).toBeDefined();
    expect(updateContentMutation.mutate).toBeDefined();
    expect(deleteContentMutation.mutate).toBeDefined();
    expect(deleteIdMutation.mutate).toBeDefined();
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
    await expect(createMutation.mutate({} as never)).resolves.toEqual({
      data: { ok: "created" },
    });
    createMutation.onSuccess?.(undefined, { contentId: "c1" });

    const updateIdMutation = queryWatchlistService.updateId("w1", {} as never);
    await expect(updateIdMutation.mutate()).resolves.toEqual({
      data: { ok: "updated" },
    });
    updateIdMutation.onSuccess?.();

    const updateContentMutation = queryWatchlistService.updateContentId();
    await expect(
      updateContentMutation.mutate({ id: "c1", data: {} as never })
    ).resolves.toEqual({ data: { ok: "updated-content" } });
    updateContentMutation.onSuccess?.(undefined, {
      id: "c1",
      data: {} as never,
    });

    const deleteContentMutation = queryWatchlistService.deleteContentId();
    await expect(
      deleteContentMutation.mutate({ contentId: "c1" })
    ).resolves.toBeUndefined();
    deleteContentMutation.onSuccess?.(undefined, { contentId: "c1" });

    const deleteIdMutation = queryWatchlistService.deleteId();
    await expect(
      deleteIdMutation.mutate({ id: "w1" })
    ).resolves.toBeUndefined();
    deleteIdMutation.onSuccess?.(undefined, { id: "w1" });

    expect(invalidateQueriesMock).toHaveBeenCalled();
  });
});
