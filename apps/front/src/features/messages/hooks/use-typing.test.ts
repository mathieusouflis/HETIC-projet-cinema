import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { emitHookMock, hookTypingState } = vi.hoisted(() => {
  const emitHookMock = vi.fn();
  const hookTypingState = {
    typingByConversation: { "conv-hook": ["u1"] },
    addTypingUser: vi.fn(),
    removeTypingUser: vi.fn(),
  };
  return { emitHookMock, hookTypingState };
});

vi.mock("@/lib/socket/socket-client", () => ({
  getSocket: () => ({ emit: emitHookMock }),
}));

vi.mock("../stores/typing.store", () => ({
  useTypingStore: (selector: (s: typeof hookTypingState) => unknown) =>
    selector(hookTypingState),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useMemo: <T>(fn: () => T) => fn(),
    useCallback: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
    useRef: <T>(initial: T) => ({ current: initial }),
  };
});

import type { TypingPayload } from "@/lib/socket/types";
import { createTypingController, useTyping } from "./use-typing";

const CONV = "conv-123";

type MockStore = {
  addTypingUser: ReturnType<typeof vi.fn>;
  removeTypingUser: ReturnType<typeof vi.fn>;
  typingByConversation: Record<string, string[]>;
};

type MockSocket = {
  emit: ReturnType<typeof vi.fn>;
};

function makeController(
  store: MockStore,
  socket: MockSocket,
  conversationId = CONV
) {
  return createTypingController(
    conversationId,
    store as never,
    socket as never
  );
}

describe("createTypingController", () => {
  let store: MockStore;
  let socket: MockSocket;

  beforeEach(() => {
    store = {
      addTypingUser: vi.fn(),
      removeTypingUser: vi.fn(),
      typingByConversation: {},
    };
    socket = { emit: vi.fn() };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("emitTyping fires socket emit immediately on first call", () => {
    const { emitTyping } = makeController(store, socket);
    emitTyping();
    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("message:typing", {
      conversationId: CONV,
    });
  });

  it("emitTyping is debounced: 3 calls within 2 s only emit once", () => {
    const { emitTyping } = makeController(store, socket);
    emitTyping();
    vi.advanceTimersByTime(600);
    emitTyping();
    vi.advanceTimersByTime(600);
    emitTyping();
    expect(socket.emit).toHaveBeenCalledTimes(1);
  });

  it("emitTyping emits again after the 2 s debounce window", () => {
    const { emitTyping } = makeController(store, socket);
    emitTyping();
    vi.advanceTimersByTime(2001);
    emitTyping();
    expect(socket.emit).toHaveBeenCalledTimes(2);
  });

  it("receiveTyping adds the user to the typing store", () => {
    const { receiveTyping } = makeController(store, socket);
    const payload: TypingPayload = { userId: "u-42", conversationId: CONV };
    receiveTyping(payload);
    expect(store.addTypingUser).toHaveBeenCalledWith(CONV, "u-42");
  });

  it("receiveTyping ignores events for a different conversation", () => {
    const { receiveTyping } = makeController(store, socket);
    const payload: TypingPayload = {
      userId: "u-42",
      conversationId: "other-conv",
    };
    receiveTyping(payload);
    expect(store.addTypingUser).not.toHaveBeenCalled();
  });

  it("receiveTyping auto-clears the user after 3 s", () => {
    const { receiveTyping } = makeController(store, socket);
    receiveTyping({ userId: "u-42", conversationId: CONV });
    expect(store.removeTypingUser).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(store.removeTypingUser).toHaveBeenCalledWith(CONV, "u-42");
  });

  it("a second receiveTyping event resets the 3 s auto-clear timer", () => {
    const { receiveTyping } = makeController(store, socket);
    receiveTyping({ userId: "u-42", conversationId: CONV });
    vi.advanceTimersByTime(2000);
    receiveTyping({ userId: "u-42", conversationId: CONV }); // refresh
    vi.advanceTimersByTime(2000); // total 4 s from first call — should not have cleared yet
    expect(store.removeTypingUser).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1001); // 3 s from refresh → clears now
    expect(store.removeTypingUser).toHaveBeenCalledWith(CONV, "u-42");
  });
});

describe("useTyping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes typingUsers from the store and forwards emit/receive to the controller", () => {
    const { typingUsers, emitTyping, receiveTyping } = useTyping("conv-hook");

    expect(typingUsers).toEqual(["u1"]);

    emitTyping();
    expect(emitHookMock).toHaveBeenCalledWith("message:typing", {
      conversationId: "conv-hook",
    });

    receiveTyping({ conversationId: "conv-hook", userId: "u2" });
    expect(hookTypingState.addTypingUser).toHaveBeenCalledWith(
      "conv-hook",
      "u2"
    );
  });
});
