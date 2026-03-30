import { useCallback, useMemo, useRef } from "react";
import { getSocket } from "@/lib/socket/socket-client";
import type { TypedSocket, TypingPayload } from "@/lib/socket/types";
import { useTypingStore } from "../stores/typing.store";

const EMPTY_TYPING_USERS: string[] = [];

type MinimalStore = {
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
};

type MinimalSocket = Pick<TypedSocket, "emit">;

export function createTypingController(
  conversationId: string,
  store: MinimalStore,
  socket: MinimalSocket
) {
  let lastEmit = 0;
  const clearTimers = new Map<string, ReturnType<typeof setTimeout>>();

  return {
    emitTyping(): void {
      const now = Date.now();
      if (now - lastEmit >= 2000) {
        lastEmit = now;
        socket.emit("message:typing", { conversationId });
      }
    },

    receiveTyping(payload: TypingPayload): void {
      if (payload.conversationId !== conversationId) {
        return;
      }

      store.addTypingUser(conversationId, payload.userId);

      const existing = clearTimers.get(payload.userId);
      if (existing !== undefined) {
        clearTimeout(existing);
      }

      const timer = setTimeout(() => {
        store.removeTypingUser(conversationId, payload.userId);
        clearTimers.delete(payload.userId);
      }, 3000);

      clearTimers.set(payload.userId, timer);
    },
  };
}

export function useTyping(conversationId: string) {
  const addTypingUser = useTypingStore((s) => s.addTypingUser);
  const removeTypingUser = useTypingStore((s) => s.removeTypingUser);

  const typingUsers = useTypingStore(
    (s) => s.typingByConversation[conversationId] ?? EMPTY_TYPING_USERS
  );

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  if (socketRef.current === null) {
    socketRef.current = getSocket();
  }
  const socket = socketRef.current;

  const stableStore = useMemo<MinimalStore>(
    () => ({ addTypingUser, removeTypingUser }),
    [addTypingUser, removeTypingUser]
  );

  const controller = useMemo(
    () => createTypingController(conversationId, stableStore, socket),
    [conversationId, stableStore, socket]
  );

  const emitTyping = useCallback(() => controller.emitTyping(), [controller]);
  const receiveTyping = useCallback(
    (payload: TypingPayload) => controller.receiveTyping(payload),
    [controller]
  );

  return { typingUsers, emitTyping, receiveTyping };
}
