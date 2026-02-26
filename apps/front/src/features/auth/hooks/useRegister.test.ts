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
  pOSTAuthRegister: vi.fn(),
  pOSTAuthLogin: vi.fn(),
  pOSTAuthLogout: vi.fn(),
  pOSTAuthRefresh: vi.fn(),
  gETAuthMe: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

const { toastSuccessMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: { success: toastSuccessMock },
}));

import * as sdk from "@packages/api-sdk";
import { useRegister } from "./useRegister";

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
      accessToken: "tok_abc",
      user: {
        userId: "u1",
        id: "u1",
        email: "user@example.com",
        username: "johndoe",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    },
  },
  status: 201,
  statusText: "Created",
  headers: {},
  config: { headers: new AxiosHeaders() } as never,
};

describe("useRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a success toast and navigates to /login on success", async () => {
    vi.mocked(sdk.pOSTAuthRegister).mockResolvedValue(successResponse);

    const { register } = useRegister();
    await register("user@example.com", "johndoe", "Abcdef1!");

    expect(toastSuccessMock).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
  });

  it("throws { fieldErrors.email, globalError: null } on duplicate email", async () => {
    vi.mocked(sdk.pOSTAuthRegister).mockRejectedValue(
      makeAxiosError(409, {
        success: false,
        error: "Validation failed",
        details: [{ field: "email", message: "Email already in use" }],
      })
    );

    const { register } = useRegister();

    await expect(
      register("taken@example.com", "johndoe", "Abcdef1!")
    ).rejects.toMatchObject({
      fieldErrors: { email: "Email already in use" },
      globalError: null,
    });
  });

  it("throws { fieldErrors.username, globalError: null } on duplicate username", async () => {
    vi.mocked(sdk.pOSTAuthRegister).mockRejectedValue(
      makeAxiosError(409, {
        success: false,
        error: "Validation failed",
        details: [{ field: "username", message: "Username already taken" }],
      })
    );

    const { register } = useRegister();

    await expect(
      register("user@example.com", "taken", "Abcdef1!")
    ).rejects.toMatchObject({
      fieldErrors: { username: "Username already taken" },
      globalError: null,
    });
  });

  it("throws a generic globalError on a business-level 409 without field details", async () => {
    vi.mocked(sdk.pOSTAuthRegister).mockRejectedValue(
      makeAxiosError(409, {
        success: false,
        error: "A user with that email already exists",
      })
    );

    const { register } = useRegister();

    await expect(
      register("taken@example.com", "johndoe", "Abcdef1!")
    ).rejects.toMatchObject({
      fieldErrors: {},
      globalError: "A user with that email already exists",
    });
  });

  it("throws a generic globalError for non-Axios errors", async () => {
    vi.mocked(sdk.pOSTAuthRegister).mockRejectedValue(
      new Error("Network down")
    );

    const { register } = useRegister();

    await expect(
      register("user@example.com", "johndoe", "Abcdef1!")
    ).rejects.toMatchObject({
      fieldErrors: {},
      globalError: expect.any(String),
    });
  });

  it("does not navigate on error", async () => {
    vi.mocked(sdk.pOSTAuthRegister).mockRejectedValue(
      makeAxiosError(409, { success: false, error: "Conflict" })
    );

    const { register } = useRegister();
    await expect(
      register("taken@example.com", "johndoe", "Abcdef1!")
    ).rejects.toBeDefined();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
