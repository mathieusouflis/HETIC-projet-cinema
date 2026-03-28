import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import { AuthController } from "./auth.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

const makeController = () => {
  const registerUseCase: ExecuteMock = { execute: vi.fn() };
  const loginUseCase: ExecuteMock = { execute: vi.fn() };
  const refreshTokenUseCase: ExecuteMock = { execute: vi.fn() };
  const logoutUseCase: ExecuteMock = { execute: vi.fn() };
  const forgotPasswordUseCase: ExecuteMock = { execute: vi.fn() };
  const resetPasswordUseCase: ExecuteMock = { execute: vi.fn() };
  const verifyEmailUseCase: ExecuteMock = { execute: vi.fn() };
  const resendVerificationUseCase: ExecuteMock = { execute: vi.fn() };

  const controller = new AuthController(
    registerUseCase as never,
    loginUseCase as never,
    refreshTokenUseCase as never,
    logoutUseCase as never,
    forgotPasswordUseCase as never,
    resetPasswordUseCase as never,
    verifyEmailUseCase as never,
    resendVerificationUseCase as never
  );

  return {
    controller,
    registerUseCase,
    loginUseCase,
    refreshTokenUseCase,
    logoutUseCase,
  };
};

describe("AuthController", () => {
  it("register should call use case and return 201", async () => {
    const { controller, registerUseCase } = makeController();
    const req = makeReq({
      body: { email: "john@doe.com", username: "john", password: "secret" },
    });
    const res = makeRes();
    const next = makeNext();
    registerUseCase.execute.mockResolvedValue(undefined);

    controller.register(req, res, next);
    await flush();

    expect(registerUseCase.execute).toHaveBeenCalledWith({
      email: "john@doe.com",
      username: "john",
      password: "secret",
    });
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message:
        "Un email de vérification a été envoyé. Vérifiez votre boîte mail.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("login should call use case, set cookie and return 200", async () => {
    const { controller, loginUseCase } = makeController();
    const req = makeReq({
      body: { email: "john@doe.com", password: "secret" },
    });
    const res = makeRes();
    const next = makeNext();
    const result = { accessToken: "access-2", user: { id: "u-1" } };
    loginUseCase.execute.mockResolvedValue([result, "refresh-2"]);

    controller.login(req, res, next);
    await flush();

    expect(loginUseCase.execute).toHaveBeenCalledWith({
      email: "john@doe.com",
      password: "secret",
    });
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: { user: result.user },
    });
  });

  it("refresh should read refreshToken cookie and return 200", async () => {
    const { controller, refreshTokenUseCase } = makeController();
    const req = makeReq({ cookies: { refreshToken: "old-refresh" } as never });
    const res = makeRes();
    const next = makeNext();
    const responseData = { accessToken: "access-3", user: { id: "u-2" } };
    refreshTokenUseCase.execute.mockResolvedValue([
      responseData,
      "new-refresh",
    ]);

    controller.refresh(req, res, next);
    await flush();

    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({
      refreshToken: "old-refresh",
    });
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Tokens refreshed successfully",
      data: { user: responseData.user },
    });
  });

  it("logout should return 200 success payload", async () => {
    const { controller, logoutUseCase } = makeController();
    const req = makeReq({ cookies: { refreshToken: "refresh-1" } as never });
    const res = makeRes();
    const next = makeNext();
    logoutUseCase.execute.mockResolvedValue(undefined);

    controller.logout(req, res, next);
    await flush();

    expect(logoutUseCase.execute).toHaveBeenCalledWith("refresh-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Logged out successfully",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("getMe should forward UnauthorizedError when req.user is missing", async () => {
    const { controller } = makeController();
    const req = makeReq({});
    const res = makeRes();
    const next = makeNext();

    controller.getMe(req, res, next);
    await flush();

    expect(next).toHaveBeenCalledTimes(1);
    const nextMock = next as unknown as ReturnType<typeof vi.fn>;
    expect(nextMock.mock.calls[0]?.[0]).toBeInstanceOf(UnauthorizedError);
  });

  it("getMe should return user profile when authenticated", async () => {
    const { controller } = makeController();
    const req = makeReq({
      user: { userId: "u-1", email: "u1@mail.com" } as never,
    });
    const res = makeRes();
    const next = makeNext();

    controller.getMe(req, res, next);
    await flush();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { userId: "u-1", email: "u1@mail.com" },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
