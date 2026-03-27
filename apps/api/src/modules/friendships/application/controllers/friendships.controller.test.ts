import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { FriendshipsController } from "./friendships.controller.js";

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

describe("FriendshipsController", () => {
  const makeController = () => {
    const sendFriendRequestUseCase: ExecuteMock = { execute: vi.fn() };
    const respondToFriendRequestUseCase: ExecuteMock = { execute: vi.fn() };
    const removeFriendshipUseCase: ExecuteMock = { execute: vi.fn() };
    const getMyFriendshipsUseCase: ExecuteMock = { execute: vi.fn() };

    const controller = new FriendshipsController(
      sendFriendRequestUseCase as never,
      respondToFriendRequestUseCase as never,
      removeFriendshipUseCase as never,
      getMyFriendshipsUseCase as never
    );

    return {
      controller,
      sendFriendRequestUseCase,
      respondToFriendRequestUseCase,
      removeFriendshipUseCase,
      getMyFriendshipsUseCase,
    };
  };

  it("getMyFriendships retourne 200 avec data", async () => {
    const { controller, getMyFriendshipsUseCase } = makeController();
    const req = makeReq({
      user: { userId: "u1" } as never,
      query: { status: "accepted" } as never,
    });
    const res = makeRes();
    const next = makeNext();
    getMyFriendshipsUseCase.execute.mockResolvedValue([
      { toJSON: () => ({ id: "f1" }) },
    ]);

    controller.getMyFriendships(req, res, next);
    await flush();

    expect(getMyFriendshipsUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "accepted"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: "f1" }],
    });
  });

  it("send/respond/remove executent les use-cases", async () => {
    const {
      controller,
      sendFriendRequestUseCase,
      respondToFriendRequestUseCase,
      removeFriendshipUseCase,
    } = makeController();
    const res = makeRes();
    const next = makeNext();

    sendFriendRequestUseCase.execute.mockResolvedValue({
      toJSON: () => ({ id: "f2" }),
    });
    controller.sendFriendRequest(
      makeReq({ user: { userId: "u1" } as never, params: { userId: "u2" } }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(201);

    respondToFriendRequestUseCase.execute.mockResolvedValue({
      toJSON: () => ({ id: "f2", status: "accepted" }),
    });
    controller.respondToFriendRequest(
      makeReq({
        user: { userId: "u2" } as never,
        params: { id: "f2" } as never,
        body: { status: "accepted" } as never,
      }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);

    removeFriendshipUseCase.execute.mockResolvedValue(undefined);
    controller.removeFriendship(
      makeReq({
        user: { userId: "u1" } as never,
        params: { id: "f2" } as never,
      }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
