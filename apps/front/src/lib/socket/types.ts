import type { Socket } from "socket.io-client";

export interface MessageDTO {
  id: string;
  conversationId: string;
  userId: string;
  content: string | null;
  type: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface TypingPayload {
  userId: string;
  conversationId: string;
}

export interface ConversationJoinedPayload {
  conversationId: string;
}

/**
 * Events the server emits to connected clients.
 *
 * - message:new        → a new message was persisted and broadcast to the room
 * - message:typing     → another participant is typing
 * - conversation:joined → confirmation that the client successfully joined a room
 */
export interface ServerToClientEvents {
  "conversation:joined": (data: ConversationJoinedPayload) => void;
  "message:new": (data: MessageDTO) => void;
  "message:typing": (data: TypingPayload) => void;
}

/**
 * Events the client can emit to the server.
 *
 * - conversation:join  → enter a conversation room to start receiving messages
 * - message:send       → persist + broadcast a new message via the server
 * - message:typing     → notify other participants that the current user is typing
 */
export interface ClientToServerEvents {
  "conversation:join": (data: { conversationId: string }) => void;
  "message:send": (
    data: { conversationId: string; content: string },
    ack?: (response: unknown) => void
  ) => void;
  "message:typing": (data: { conversationId: string }) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
