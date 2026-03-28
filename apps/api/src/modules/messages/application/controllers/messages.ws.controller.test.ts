import type { Socket } from "socket.io";
import { describe, expect, it, vi } from "vitest";
import { MessageWSController } from "./messages.ws.controller.js";

describe("MessageWSController", () => {
  it("handleJoinConversation emits joined event", async () => {
    const sendMessageUseCase = { execute: vi.fn() };
    const controller = new MessageWSController(sendMessageUseCase as never);
    const socket = { emit: vi.fn(), join: vi.fn() } as unknown as Socket;

    await controller.handleJoinConversation(socket, { conversationId: "c1" });

    expect(socket.join).toHaveBeenCalledWith("conversation:c1");
    expect(socket.emit).toHaveBeenCalledWith("conversation:joined", {
      conversationId: "c1",
    });
  });

  it("handleSendMessage executes use-case and emits to room", async () => {
    const sendMessageUseCase = {
      execute: vi.fn().mockResolvedValue({ toJSON: () => ({ id: "m1" }) }),
    };
    const controller = new MessageWSController(sendMessageUseCase as never);
    const emitRoom = vi.fn();
    (controller as any).namespace = {
      to: vi.fn(() => ({ emit: emitRoom })),
    };
    const socket = {} as never;
    vi.spyOn(controller as any, "getSocketUser").mockReturnValue({
      userId: "u1",
      email: "john@doe.com",
    });

    await controller.handleSendMessage(socket, {
      conversationId: "c1",
      content: "hello",
    });

    expect(sendMessageUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "c1",
      "hello"
    );
    expect(emitRoom).toHaveBeenCalledWith("message:new", { id: "m1" });
  });

  it("handleTyping emits typing payload to room peers", async () => {
    const sendMessageUseCase = { execute: vi.fn() };
    const controller = new MessageWSController(sendMessageUseCase as never);
    const emit = vi.fn();
    const socket = {
      to: vi.fn(() => ({ emit })),
    } as unknown as Socket;
    vi.spyOn(controller as any, "getSocketUser").mockReturnValue({
      userId: "u1",
      email: "john@doe.com",
    });

    await controller.handleTyping(socket, { conversationId: "c1" });

    expect(socket.to).toHaveBeenCalledWith("conversation:c1");
    expect(emit).toHaveBeenCalledWith("message:typing", {
      userId: "u1",
      conversationId: "c1",
    });
  });
});
