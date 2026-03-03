import { config } from "@packages/config";
import { io } from "socket.io-client";
import { useAuth } from "@/features/auth/stores/auth.store";
import type {
  ConversationJoinedPayload,
  MessageDTO,
  TypedSocket,
  TypingPayload,
} from "./types";

let socket: TypedSocket | null = null;

function getSocket(): TypedSocket {
  if (socket) {
    return socket;
  }

  const token = useAuth.getState().accessToken;
  const baseUrl = config.env.backend.apiUrl;

  socket = io(`${baseUrl}/messages`, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  }) as TypedSocket;

  return socket;
}

/**
 * Tear down the socket connection and clear the singleton reference.
 * Call this on logout.
 */
function destroySocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Refresh the auth token on an existing (or new) socket.
 * Useful when the access token is silently refreshed.
 */
function refreshSocketAuth(): void {
  const token = useAuth.getState().accessToken;
  if (socket) {
    socket.auth = { token };
    socket.disconnect().connect();
  }
}

/**
 * Semantic WebSocket service object.
 *
 * Usage:
 *   const ws = getWebsocketServices();
 *   ws.emit.joinConversation("conv-id");
 *   const off = ws.on.newMessage((msg) => { ... });
 *   // later:
 *   off();
 */
export function getWebsocketServices() {
  return {
    /** Connect / lifecycle */
    connect() {
      getSocket();
    },

    disconnect: destroySocket,

    refreshAuth: refreshSocketAuth,

    /** Emit helpers */
    emit: {
      joinConversation(conversationId: string) {
        getSocket().emit("conversation:join", { conversationId });
      },

      sendMessage(conversationId: string, content: string) {
        getSocket().emit("message:send", { conversationId, content });
      },

      typing(conversationId: string) {
        getSocket().emit("message:typing", { conversationId });
      },
    },

    /** Subscription helpers — each returns a cleanup function */
    on: {
      newMessage(handler: (data: MessageDTO) => void): () => void {
        const s = getSocket();
        s.on("message:new", handler);
        return () => s.off("message:new", handler);
      },

      typing(handler: (data: TypingPayload) => void): () => void {
        const s = getSocket();
        s.on("message:typing", handler);
        return () => s.off("message:typing", handler);
      },

      conversationJoined(
        handler: (data: ConversationJoinedPayload) => void
      ): () => void {
        const s = getSocket();
        s.on("conversation:joined", handler);
        return () => s.off("conversation:joined", handler);
      },
    },
  };
}

export { destroySocket, getSocket, refreshSocketAuth };
