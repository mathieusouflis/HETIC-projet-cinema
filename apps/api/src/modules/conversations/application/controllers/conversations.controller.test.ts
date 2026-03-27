import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ConversationsController } from "./conversations.controller.js";

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

describe("ConversationsController", () => {
  const makeController = () => {
    const createConversationUseCase: ExecuteMock = { execute: vi.fn() };
    const getConversationsUseCase: ExecuteMock = { execute: vi.fn() };
    const getConversationUseCase: ExecuteMock = { execute: vi.fn() };
    const markConversationReadUseCase: ExecuteMock = { execute: vi.fn() };

    const controller = new ConversationsController(
      createConversationUseCase as never,
      getConversationsUseCase as never,
      getConversationUseCase as never,
      markConversationReadUseCase as never
    );

    return {
      controller,
      createConversationUseCase,
      getConversationsUseCase,
      getConversationUseCase,
      markConversationReadUseCase,
    };
  };

  it("getConversations et getConversation retournent 200", async () => {
    const { controller, getConversationsUseCase, getConversationUseCase } =
      makeController();
    const res = makeRes();
    const next = makeNext();

    getConversationsUseCase.execute.mockResolvedValue([{ id: "conv-1" }]);
    controller.getConversations(
      makeReq({ user: { userId: "u1" } as never }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);

    getConversationUseCase.execute.mockResolvedValue({ id: "conv-1" });
    controller.getConversation(
      makeReq({
        user: { userId: "u1" } as never,
        params: { id: "conv-1" } as never,
      }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("createConversation et markAsRead executent les use-cases", async () => {
    const {
      controller,
      createConversationUseCase,
      markConversationReadUseCase,
    } = makeController();
    const res = makeRes();
    const next = makeNext();

    createConversationUseCase.execute.mockResolvedValue({
      toJSON: () => ({ id: "conv-2" }),
    });
    controller.createConversation(
      makeReq({
        user: { userId: "u1" } as never,
        body: { friendId: "u2" } as never,
      }),
      res,
      next
    );
    await flush();
    expect(createConversationUseCase.execute).toHaveBeenCalledWith("u1", "u2");
    expect(res.status).toHaveBeenCalledWith(201);

    markConversationReadUseCase.execute.mockResolvedValue(undefined);
    controller.markAsRead(
      makeReq({
        user: { userId: "u1" } as never,
        params: { id: "conv-2" } as never,
      }),
      res,
      next
    );
    await flush();
    expect(markConversationReadUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "conv-2"
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
