// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/api-sdk", () => ({
  pATCHUsersMe: vi.fn(),
  gETUsersMe: vi.fn(),
  dELETEUsersMe: vi.fn(),
}));

const { invalidateQueriesMock } = vi.hoisted(() => ({
  invalidateQueriesMock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/api/client", () => ({
  queryClient: { invalidateQueries: invalidateQueriesMock },
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((config) => config),
  useMutation: vi.fn((config) => config),
}));

const { setUserMock } = vi.hoisted(() => ({
  setUserMock: vi.fn(),
}));
vi.mock("@/features/auth/stores/auth.store", () => ({
  useAuth: Object.assign(() => ({ user: { id: "u1", username: "old" } }), {
    getState: () => ({
      user: { id: "u1", username: "old" },
      setUser: setUserMock,
    }),
  }),
}));

import * as sdk from "@packages/api-sdk";
import { queryUserService } from "./index";

describe("queryUserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds getMe query with enabled user", () => {
    const query = queryUserService.getMe();
    expect(query.enabled).toBe(true);
  });

  it("executes patchMe success path and updates cache/user", async () => {
    vi.mocked(sdk.pATCHUsersMe).mockResolvedValue({
      data: { data: { username: "new-name" } },
    } as never);
    const mutation = queryUserService.patchMe();
    const response = await mutation.mutationFn({
      username: "new-name",
    } as never);
    await mutation.onSuccess?.(response);

    expect(invalidateQueriesMock).toHaveBeenCalled();
    expect(setUserMock).toHaveBeenCalledWith({
      id: "u1",
      username: "new-name",
    });
  });

  it("executes deleteMe mutation", async () => {
    vi.mocked(sdk.dELETEUsersMe).mockResolvedValue({} as never);
    const mutation = queryUserService.deleteMe();
    await expect(mutation.mutationFn()).resolves.toBeUndefined();
  });
});
