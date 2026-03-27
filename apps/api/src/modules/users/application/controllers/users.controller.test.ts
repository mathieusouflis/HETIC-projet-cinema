import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../../../shared/errors/index.js";
import { UsersController } from "./users.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));
const asMock = (fn: NextFunction) => fn as unknown as ReturnType<typeof vi.fn>;

const makeController = () => {
  const getUserByIdUseCase: ExecuteMock = { execute: vi.fn() };
  const getUsersUseCase: ExecuteMock = { execute: vi.fn() };
  const updateUserUseCase: ExecuteMock = { execute: vi.fn() };
  const deleteUserUseCase: ExecuteMock = { execute: vi.fn() };
  const getMeUseCase: ExecuteMock = { execute: vi.fn() };

  const controller = new UsersController(
    getUserByIdUseCase as never,
    getUsersUseCase as never,
    updateUserUseCase as never,
    deleteUserUseCase as never,
    getMeUseCase as never
  );

  return {
    controller,
    getUserByIdUseCase,
    getUsersUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    getMeUseCase,
  };
};

describe("UsersController", () => {
  it("getById should call use case and return 200 payload", async () => {
    const { controller, getUserByIdUseCase } = makeController();
    const req = makeReq({ params: { id: "u-1" } as never });
    const res = makeRes();
    const next = makeNext();
    const user = { id: "u-1", username: "john" };
    getUserByIdUseCase.execute.mockResolvedValue(user);

    controller.getById(req, res, next);
    await flush();

    expect(getUserByIdUseCase.execute).toHaveBeenCalledWith("u-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: user });
    expect(next).not.toHaveBeenCalled();
  });

  it("getAll should pass query pagination to use case", async () => {
    const { controller, getUsersUseCase } = makeController();
    const req = makeReq({ query: { page: "1", limit: "10", offset: "0" } });
    const res = makeRes();
    const next = makeNext();
    const result = { items: [{ id: "u-1" }], total: 1 };
    getUsersUseCase.execute.mockResolvedValue(result);

    controller.getAll(req, res, next);
    await flush();

    expect(getUsersUseCase.execute).toHaveBeenCalledWith({
      page: "1",
      limit: "10",
      offset: "0",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: result });
  });

  it("update should call update use case with params id and body", async () => {
    const { controller, updateUserUseCase } = makeController();
    const req = makeReq({
      params: { id: "u-2" } as never,
      body: { username: "new-name" },
    });
    const res = makeRes();
    const next = makeNext();
    const updated = { id: "u-2", username: "new-name" };
    updateUserUseCase.execute.mockResolvedValue(updated);

    controller.update(req, res, next);
    await flush();

    expect(updateUserUseCase.execute).toHaveBeenCalledWith("u-2", {
      username: "new-name",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
  });

  it("delete should call delete use case and answer 204", async () => {
    const { controller, deleteUserUseCase } = makeController();
    const req = makeReq({ params: { id: "u-3" } as never });
    const res = makeRes();
    const next = makeNext();
    deleteUserUseCase.execute.mockResolvedValue(undefined);

    controller.delete(req, res, next);
    await flush();

    expect(deleteUserUseCase.execute).toHaveBeenCalledWith("u-3");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("getMe should forward UnauthorizedError when user is missing", async () => {
    const { controller, getMeUseCase } = makeController();
    const req = makeReq({});
    const res = makeRes();
    const next = makeNext();

    controller.getMe(req, res, next);
    await flush();

    expect(getMeUseCase.execute).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(asMock(next).mock.calls[0]?.[0]).toBeInstanceOf(UnauthorizedError);
  });

  it("getMe should call use case and answer 200 when authenticated", async () => {
    const { controller, getMeUseCase } = makeController();
    const req = makeReq({ user: { userId: "me-1" } as never });
    const res = makeRes();
    const next = makeNext();
    const user = { id: "me-1", username: "me" };
    getMeUseCase.execute.mockResolvedValue(user);

    controller.getMe(req, res, next);
    await flush();

    expect(getMeUseCase.execute).toHaveBeenCalledWith("me-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: user });
  });

  it("updateMe should forward UnauthorizedError when user is missing", async () => {
    const { controller, updateUserUseCase } = makeController();
    const req = makeReq({ body: { bio: "test" } });
    const res = makeRes();
    const next = makeNext();

    controller.updateMe(req, res, next);
    await flush();

    expect(updateUserUseCase.execute).not.toHaveBeenCalled();
    expect(asMock(next).mock.calls[0]?.[0]).toBeInstanceOf(UnauthorizedError);
  });

  it("updateMe should call update use case with authenticated user id", async () => {
    const { controller, updateUserUseCase } = makeController();
    const req = makeReq({
      user: { userId: "me-2" } as never,
      body: { displayName: "Me 2" },
    });
    const res = makeRes();
    const next = makeNext();
    const updated = { id: "me-2", displayName: "Me 2" };
    updateUserUseCase.execute.mockResolvedValue(updated);

    controller.updateMe(req, res, next);
    await flush();

    expect(updateUserUseCase.execute).toHaveBeenCalledWith("me-2", {
      displayName: "Me 2",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
  });
});
