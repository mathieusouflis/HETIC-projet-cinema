import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../../../shared/errors/index.js";
import { AuthController } from "./auth.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    cookie: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

const makeController = () => {
  const registerUseCase: ExecuteMock = { execute: vi.fn() };
  const loginUseCase: ExecuteMock = { execute: vi.fn() };
  const refreshTokenUseCase: ExecuteMock = { execute: vi.fn() };

  const controller = new AuthController(
    registerUseCase as never,
    loginUseCase as never,
    refreshTokenUseCase as never
  );

  return { controller, registerUseCase, loginUseCase, refreshTokenUseCase };
};

describe("AuthController", () => {
  it("register should call use case, set cookie and return 201", async () => {
    const { controller, registerUseCase } = makeController();
    const req = makeReq({
      body: { email: "john@doe.com", username: "john", password: "secret" },
    });
    const res = makeRes();
    const next = makeNext();
    const result = { accessToken: "access-1" };
    registerUseCase.execute.mockResolvedValue([result, "refresh-1"]);

    controller.register(req, res, next);
    await flush();

    expect(registerUseCase.execute).toHaveBeenCalledWith({
      email: "john@doe.com",
      username: "john",
      password: "secret",
    });
    expect(res.cookie).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User registered successfully",
      data: result,
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
    const result = { accessToken: "access-2" };
    loginUseCase.execute.mockResolvedValue([result, "refresh-2"]);

    controller.login(req, res, next);
    await flush();

    expect(loginUseCase.execute).toHaveBeenCalledWith({
      email: "john@doe.com",
      password: "secret",
    });
    expect(res.cookie).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: result,
    });
  });

  it("refresh should read refreshToken cookie and return 200", async () => {
    const { controller, refreshTokenUseCase } = makeController();
    const req = makeReq({ cookies: { refreshToken: "old-refresh" } as never });
    const res = makeRes();
    const next = makeNext();
    const responseData = { accessToken: "access-3" };
    refreshTokenUseCase.execute.mockResolvedValue([
      responseData,
      "new-refresh",
    ]);

    controller.refresh(req, res, next);
    await flush();

    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({
      refreshToken: "old-refresh",
    });
    expect(res.cookie).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Tokens refreshed successfully",
      data: responseData,
    });
  });

  it("logout should return 200 success payload", async () => {
    const { controller } = makeController();
    const req = makeReq({});
    const res = makeRes();
    const next = makeNext();

    controller.logout(req, res, next);
    await flush();

    expect(res.status).toHaveBeenCalledWith(200);
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
