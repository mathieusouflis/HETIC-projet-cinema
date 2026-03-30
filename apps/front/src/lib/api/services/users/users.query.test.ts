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
const { authState } = vi.hoisted(() => ({
  authState: {
    user: { id: "u1", username: "old" } as null | {
      id: string;
      username: string;
    },
    setUser: setUserMock,
  },
}));

vi.mock("@/features/auth/stores/auth.store", () => ({
  useAuth: Object.assign(() => ({ user: authState.user }), {
    getState: () => authState,
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

  it("builds getMe query disabled when user is null", () => {
    authState.user = null;
    const query = queryUserService.getMe();
    expect(query.enabled).toBe(false);
    authState.user = { id: "u1", username: "old" };
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

  it("patchMe onSuccess does not setUser when response has no data", async () => {
    const mutation = queryUserService.patchMe();
    await mutation.onSuccess?.({} as never);
    expect(setUserMock).not.toHaveBeenCalled();
  });

  it("patchMe onSuccess falls back to existing username when new one is nullish", async () => {
    const mutation = queryUserService.patchMe();
    await mutation.onSuccess?.({ data: { username: undefined } } as never);
    expect(setUserMock).toHaveBeenCalledWith({
      id: "u1",
      username: "old",
    });
  });

  it("executes deleteMe mutation", async () => {
    vi.mocked(sdk.dELETEUsersMe).mockResolvedValue({} as never);
    const mutation = queryUserService.deleteMe();
    await expect(mutation.mutationFn()).resolves.toBeUndefined();
  });
});
