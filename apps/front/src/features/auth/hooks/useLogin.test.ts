import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: <T>(initial: T): [T, (v: T) => void] => {
      let val = initial;
      return [
        val,
        (v: T) => {
          val = v;
        },
      ];
    },
  };
});

vi.mock("@packages/api-sdk", () => ({
  pOSTAuthLogin: vi.fn(),
  pOSTAuthLogout: vi.fn(),
  pOSTAuthRefresh: vi.fn(),
  pOSTAuthRegister: vi.fn(),
  gETAuthMe: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

const setUserMock = vi.fn();
const setAccessTokenMock = vi.fn();
vi.mock("../stores/auth.store", () => ({
  useAuth: () => ({
    setUser: setUserMock,
    setAccessToken: setAccessTokenMock,
  }),
}));

import * as sdk from "@packages/api-sdk";
import { useLogin } from "./useLogin";

function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = {
    status,
    statusText: String(status),
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  };
  return err;
}

const successResponse = {
  data: {
    success: true,
    data: {
      accessToken: "tok_123",
      user: {
        userId: "u1",
        id: "u1",
        email: "user@example.com",
        username: "johndoe",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    },
  },
  status: 200,
  statusText: "OK",
  headers: {},
  config: { headers: new AxiosHeaders() } as never,
};

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores user and token then navigates to / on success", async () => {
    vi.mocked(sdk.pOSTAuthLogin).mockResolvedValue(successResponse);

    const { login } = useLogin();
    await login("user@example.com", "Abcdef1!");

    expect(setAccessTokenMock).toHaveBeenCalledWith("tok_123");
    expect(setUserMock).toHaveBeenCalledWith(successResponse.data.data.user);
    expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
  });

  it("throws { fieldErrors, globalError } on 401", async () => {
    vi.mocked(sdk.pOSTAuthLogin).mockRejectedValue(
      makeAxiosError(401, { success: false, error: "Wrong email or password" })
    );

    const { login } = useLogin();

    await expect(login("bad@example.com", "wrongpass")).rejects.toMatchObject({
      fieldErrors: {},
      globalError: "Wrong email or password",
    });
  });

  it("throws { fieldErrors, globalError } on 400 with field details", async () => {
    vi.mocked(sdk.pOSTAuthLogin).mockRejectedValue(
      makeAxiosError(400, {
        success: false,
        error: "Validation failed",
        details: [{ field: "email", message: "Invalid email format" }],
      })
    );

    const { login } = useLogin();

    await expect(login("bad", "Abcdef1!")).rejects.toMatchObject({
      fieldErrors: { email: "Invalid email format" },
      globalError: null,
    });
  });

  it("throws a generic globalError for non-Axios errors", async () => {
    vi.mocked(sdk.pOSTAuthLogin).mockRejectedValue(new Error("Network down"));

    const { login } = useLogin();

    await expect(login("user@example.com", "Abcdef1!")).rejects.toMatchObject({
      fieldErrors: {},
      globalError: expect.any(String),
    });
  });

  it("does not navigate on error", async () => {
    vi.mocked(sdk.pOSTAuthLogin).mockRejectedValue(
      makeAxiosError(401, { success: false, error: "Unauthorized" })
    );

    const { login } = useLogin();
    await expect(login("bad@example.com", "Abcdef1!")).rejects.toBeDefined();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
