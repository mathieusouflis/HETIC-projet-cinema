// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/api-sdk", () => ({
  gETFriendships: vi.fn(),
  pOSTFriendshipsUserId: vi.fn(),
  pATCHFriendshipsId: vi.fn(),
  dELETEFriendshipsId: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((config) => config),
  useMutation: vi.fn((config) => config),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock("@/features/auth/stores/auth.store", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));

import * as sdk from "@packages/api-sdk";
import { friendshipService, queryFriendshipService } from "./index";

describe("friendshipService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps list and calls basic operations", async () => {
    vi.mocked(sdk.gETFriendships).mockResolvedValue({
      data: {
        data: [{ id: "f1", userId: "u1", friendId: "u2", status: "pending" }],
      },
    } as never);
    vi.mocked(sdk.pOSTFriendshipsUserId).mockResolvedValue({
      data: {
        data: { id: "f2", userId: "u1", friendId: "u3", status: "pending" },
      },
    } as never);
    vi.mocked(sdk.pATCHFriendshipsId).mockResolvedValue({} as never);
    vi.mocked(sdk.dELETEFriendshipsId).mockResolvedValue({} as never);

    await expect(friendshipService.list()).resolves.toHaveLength(1);
    await expect(friendshipService.send("u3")).resolves.toMatchObject({
      id: "f2",
    });
    await expect(
      friendshipService.respond("f2", "accepted")
    ).resolves.toBeUndefined();
    await expect(friendshipService.remove("f2")).resolves.toBeUndefined();
  });

  it("builds query hooks for list/send/respond/remove", () => {
    const listQuery = queryFriendshipService.list();
    const sendMutation = queryFriendshipService.send();
    const respondMutation = queryFriendshipService.respond();
    const removeMutation = queryFriendshipService.remove();

    expect(listQuery.enabled).toBe(true);
    expect(sendMutation.mutationFn).toBeDefined();
    expect(respondMutation.mutationFn).toBeDefined();
    expect(removeMutation.mutationFn).toBeDefined();
  });

  it("executes query mutation functions", async () => {
    vi.mocked(sdk.pOSTFriendshipsUserId).mockResolvedValue({
      data: {
        data: { id: "f10", userId: "u1", friendId: "u9", status: "pending" },
      },
    } as never);
    vi.mocked(sdk.pATCHFriendshipsId).mockResolvedValue({} as never);
    vi.mocked(sdk.dELETEFriendshipsId).mockResolvedValue({} as never);

    const sendMutation = queryFriendshipService.send();
    await expect(sendMutation.mutationFn("u9")).resolves.toMatchObject({
      id: "f10",
    });

    const respondMutation = queryFriendshipService.respond();
    await expect(
      respondMutation.mutationFn({ id: "f10", status: "accepted" })
    ).resolves.toBeUndefined();

    const removeMutation = queryFriendshipService.remove();
    await expect(removeMutation.mutationFn("f10")).resolves.toBeUndefined();
  });
});
