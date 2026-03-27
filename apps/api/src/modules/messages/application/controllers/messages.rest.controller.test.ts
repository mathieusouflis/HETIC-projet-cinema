import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { MessagesRestController } from "./messages.rest.controller.js";

type ExecuteMock = { execute: ReturnType<typeof vi.fn> };

const makeReq = (input?: Partial<Request>) => input as Request;
const makeRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }) as unknown as Response;
const makeNext = () => vi.fn() as NextFunction;
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe("MessagesRestController", () => {
  it("get/send/edit/delete message flows", async () => {
    const getMessagesUseCase: ExecuteMock = { execute: vi.fn() };
    const sendMessageUseCase: ExecuteMock = { execute: vi.fn() };
    const editMessageUseCase: ExecuteMock = { execute: vi.fn() };
    const deleteMessageUseCase: ExecuteMock = { execute: vi.fn() };
    const controller = new MessagesRestController(
      getMessagesUseCase as never,
      sendMessageUseCase as never,
      editMessageUseCase as never,
      deleteMessageUseCase as never
    );
    const res = makeRes();
    const next = makeNext();

    getMessagesUseCase.execute.mockResolvedValue({
      items: [{ toJSON: () => ({ id: "m1" }) }],
      nextCursor: "next",
      hasMore: true,
    });
    controller.getMessages(
      makeReq({
        user: { userId: "u1" } as never,
        params: { conversationId: "c1" } as never,
        query: { cursor: undefined, limit: 20 } as never,
      }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);

    const message = { toJSON: () => ({ id: "m2" }) };
    sendMessageUseCase.execute.mockResolvedValue(message);
    controller.sendMessage(
      makeReq({
        user: { userId: "u1" } as never,
        params: { conversationId: "c1" } as never,
        body: { content: "hello" } as never,
      }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(201);

    editMessageUseCase.execute.mockResolvedValue(message);
    controller.editMessage(
      makeReq({
        user: { userId: "u1" } as never,
        params: { messageId: "m2" } as never,
        body: { content: "edited" } as never,
      }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);

    deleteMessageUseCase.execute.mockResolvedValue(message);
    controller.deleteMessage(
      makeReq({
        user: { userId: "u1" } as never,
        params: { messageId: "m2" } as never,
      }),
      res,
      next
    );
    await flush();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
