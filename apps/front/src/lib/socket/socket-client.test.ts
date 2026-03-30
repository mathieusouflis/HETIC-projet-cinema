import { beforeEach, describe, expect, it, vi } from "vitest";

const ioMock = vi.fn();

vi.mock("@packages/config", () => ({
  config: {
    env: {
      backend: {
        apiUrl: "http://localhost:3000",
      },
    },
  },
}));

vi.mock("socket.io-client", () => ({
  io: (...args: unknown[]) => ioMock(...args),
}));

type MockSocket = {
  emit: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
};

function makeSocket(): MockSocket {
  const socket = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
  };
  socket.disconnect.mockReturnValue(socket);
  socket.connect.mockReturnValue(socket);
  return socket;
}

describe("socket-client", () => {
  beforeEach(() => {
    ioMock.mockReset();
    vi.resetModules();
  });

  it("destroySocket and refreshSocketAuth are safe when socket is null", async () => {
    const { destroySocket, refreshSocketAuth } = await import(
      "./socket-client"
    );
    expect(() => destroySocket()).not.toThrow();
    expect(() => refreshSocketAuth()).not.toThrow();
  });

  it("creates and reuses a singleton socket", async () => {
    const socket = makeSocket();
    ioMock.mockReturnValue(socket);
    const { getSocket } = await import("./socket-client");

    const s1 = getSocket();
    const s2 = getSocket();

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(s1).toBe(s2);
  });

  it("destroySocket disconnects and resets the singleton", async () => {
    const first = makeSocket();
    const second = makeSocket();
    ioMock.mockReturnValueOnce(first).mockReturnValueOnce(second);
    const { destroySocket, getSocket } = await import("./socket-client");

    getSocket();
    destroySocket();
    getSocket();

    expect(first.disconnect).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledTimes(2);
  });

  it("websocket service emits and subscribes correctly", async () => {
    const socket = makeSocket();
    ioMock.mockReturnValue(socket);
    const { getWebsocketServices } = await import("./socket-client");

    const ws = getWebsocketServices();
    ws.connect();
    ws.emit.joinConversation("c1");
    ws.emit.sendMessage("c1", "hello");
    ws.emit.typing("c1");

    const offNew = ws.on.newMessage(() => undefined);
    const offTyping = ws.on.typing(() => undefined);
    const offJoined = ws.on.conversationJoined(() => undefined);
    offNew();
    offTyping();
    offJoined();

    ws.refreshAuth();
    ws.disconnect();

    expect(socket.emit).toHaveBeenCalledWith("conversation:join", {
      conversationId: "c1",
    });
    expect(socket.emit).toHaveBeenCalledWith("message:send", {
      conversationId: "c1",
      content: "hello",
    });
    expect(socket.emit).toHaveBeenCalledWith("message:typing", {
      conversationId: "c1",
    });
    expect(socket.on).toHaveBeenCalledTimes(3);
    expect(socket.off).toHaveBeenCalledTimes(3);
    expect(socket.disconnect).toHaveBeenCalled();
    expect(socket.connect).toHaveBeenCalled();
  });
});
