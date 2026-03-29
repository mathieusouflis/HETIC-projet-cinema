// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@packages/api-sdk", () => ({
  pOSTAuthRegister: vi.fn(),
  pOSTAuthLogin: vi.fn(),
  pOSTAuthLogout: vi.fn(),
  pOSTAuthRefresh: vi.fn(),
  gETAuthMe: vi.fn(),
  pOSTAuthForgotPassword: vi.fn(),
  pOSTAuthResetPassword: vi.fn(),
  pOSTAuthVerifyEmail: vi.fn(),
  pOSTAuthResendVerification: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn((config) => ({
    ...config,
    isEnabled: config.enabled ?? true,
  })),
}));

const setUserMock = vi.fn();
vi.mock("@/features/auth/stores/auth.store", () => ({
  useAuth: { getState: () => ({ setUser: setUserMock }) },
}));

import * as sdk from "@packages/api-sdk";
import { authService, queryAuthService } from "./auth";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls imperative endpoints and returns data", async () => {
    vi.mocked(sdk.pOSTAuthRegister).mockResolvedValue({
      data: { ok: 1 },
    } as never);
    vi.mocked(sdk.pOSTAuthLogin).mockResolvedValue({
      data: { ok: 2 },
    } as never);
    vi.mocked(sdk.pOSTAuthRefresh).mockResolvedValue({
      data: { ok: 3 },
    } as never);
    vi.mocked(sdk.gETAuthMe).mockResolvedValue({ data: { ok: 4 } } as never);
    vi.mocked(sdk.pOSTAuthForgotPassword).mockResolvedValue({
      data: { ok: 5 },
    } as never);
    vi.mocked(sdk.pOSTAuthResetPassword).mockResolvedValue({
      data: { ok: 6 },
    } as never);
    vi.mocked(sdk.pOSTAuthVerifyEmail).mockResolvedValue({
      data: { data: { user: { id: "u1" } } },
    } as never);
    vi.mocked(sdk.pOSTAuthResendVerification).mockResolvedValue({
      data: { ok: 8 },
    } as never);
    vi.mocked(sdk.pOSTAuthLogout).mockResolvedValue({} as never);

    await expect(authService.register({} as never)).resolves.toEqual({ ok: 1 });
    await expect(authService.login({} as never)).resolves.toEqual({ ok: 2 });
    await expect(authService.refresh()).resolves.toEqual({ ok: 3 });
    await expect(authService.me()).resolves.toEqual({ ok: 4 });
    await expect(authService.forgotPassword({} as never)).resolves.toEqual({
      ok: 5,
    });
    await expect(authService.resetPassword({} as never)).resolves.toEqual({
      ok: 6,
    });
    await expect(authService.verifyEmail({ token: "t" })).resolves.toEqual({
      data: { user: { id: "u1" } },
    });
    await expect(authService.resendVerification({} as never)).resolves.toEqual({
      ok: 8,
    });
    await expect(authService.logout()).resolves.toBeUndefined();
  });

  it("builds verifyEmail query and executes queryFn side effects", async () => {
    vi.mocked(sdk.pOSTAuthVerifyEmail).mockResolvedValue({
      data: { data: { user: { id: "u2" } } },
    } as never);
    const onSuccess = vi.fn();

    const config = queryAuthService.verifyEmail("tok", onSuccess);

    expect(config.isEnabled).toBe(true);
    const result = await config.queryFn();
    expect(result).toEqual({ data: { user: { id: "u2" } } });
    expect(setUserMock).toHaveBeenCalledWith({ id: "u2" });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
