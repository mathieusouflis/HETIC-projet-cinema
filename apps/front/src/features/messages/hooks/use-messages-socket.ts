import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useAuth } from "@/features/auth/stores/auth.store";
import { conversationKeys } from "@/lib/api/services/conversations/keys";
import { messageKeys } from "@/lib/api/services/messages/keys";
import type { MessageDTO } from "@/lib/socket";
import { getSocket } from "@/lib/socket";
import type { Conversation, Message, MessagePage } from "../types";
import { useTyping } from "./use-typing";

function dtoToMessage(dto: MessageDTO): Message {
  return {
    id: dto.id,
    conversationId: dto.conversationId,
    userId: dto.userId,
    content: dto.content,
    type: dto.type,
    isDeleted: dto.isDeleted,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt ?? null,
    deletedAt: dto.deletedAt ?? null,
  };
}

export function useMessagesSocket(conversationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { receiveTyping } = useTyping(conversationId);

  const activeConversationRef = useRef<string | null>(null);
  const cleanupRef = useRef<() => void>(() => undefined);

  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  const userRef = useRef(user);
  userRef.current = user;

  const receiveTypingRef = useRef(receiveTyping);
  receiveTypingRef.current = receiveTyping;

  if (activeConversationRef.current !== conversationId) {
    cleanupRef.current();
    cleanupRef.current = () => undefined;
    activeConversationRef.current = conversationId;

    if (conversationId) {
      const socket = getSocket();

      socket.emit("conversation:join", { conversationId });

      const queryKey = messageKeys.conversation(conversationId);

      const onNew = (dto: MessageDTO) => {
        if (dto.conversationId !== conversationId) return;

        const qc = queryClientRef.current;
        const realMessage = dtoToMessage(dto);

        qc.setQueryData<{
          pages: MessagePage[];
          pageParams: unknown[];
        }>(queryKey, (old) => {
          if (!old) {
            return {
              pages: [
                {
                  items: [realMessage],
                  nextCursor: null,
                  hasMore: false,
                },
              ],
              pageParams: [undefined],
            };
          }

          const alreadyExists = old.pages.some((page) =>
            page.items.some((m) => m.id === dto.id)
          );
          if (alreadyExists) return old;

          const pages = [...old.pages];
          const lastPage = pages[pages.length - 1];

          if (lastPage) {
            pages[pages.length - 1] = {
              ...lastPage,
              items: [...lastPage.items, realMessage],
            };
          }

          return { ...old, pages };
        });

        const userId = userRef.current?.id ?? "";
        if (userId) {
          qc.setQueryData<Conversation[]>(
            conversationKeys.all(userId),
            (old) => {
              if (!old) return old;
              const updated = old.map((c) =>
                c.id === conversationId
                  ? {
                      ...c,
                      lastMessage: {
                        id: realMessage.id,
                        content: realMessage.content,
                        isDeleted: realMessage.isDeleted,
                        createdAt: realMessage.createdAt,
                        authorId: realMessage.userId,
                      },
                    }
                  : c
              );
              return [...updated].sort((a, b) => {
                const ta = a.lastMessage?.createdAt ?? a.createdAt ?? "";
                const tb = b.lastMessage?.createdAt ?? b.createdAt ?? "";
                return tb.localeCompare(ta);
              });
            }
          );
        }
      };

      const onTyping = (payload: Parameters<typeof receiveTyping>[0]) => {
        receiveTypingRef.current(payload);
      };

      socket.on("message:new", onNew);
      socket.on("message:typing", onTyping);

      cleanupRef.current = () => {
        socket.off("message:new", onNew);
        socket.off("message:typing", onTyping);
        activeConversationRef.current = null; // required for Strict Mode remount
      };
    }
  }

  return { cleanupRef };
}
