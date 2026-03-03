import {
  dELETEMessagesMessageId,
  type GETMessagesConversationsConversationId200DataItemsItem,
  gETMessagesConversationsConversationId,
  pATCHMessagesMessageId,
} from "@packages/api-sdk";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Message, MessagePage } from "@/features/messages/types";
import { getSocket } from "@/lib/socket";
import { messageKeys } from "./keys";

export function toMessage(
  item: GETMessagesConversationsConversationId200DataItemsItem
): Message {
  return {
    id: item.id,
    conversationId: item.conversationId,
    userId: item.userId,
    content: item.content ?? null,
    type: item.type,
    isDeleted: item.isDeleted,
    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
    deletedAt: item.deletedAt ?? null,
  };
}

const fetchMessages = async (
  conversationId: string,
  cursor?: string,
  limit = 30
): Promise<MessagePage> => {
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  const response = await gETMessagesConversationsConversationId(
    conversationId,
    params
  );
  const raw = response.data.data;
  return {
    items: raw.items.map((item) => toMessage(item)),
    nextCursor: raw.nextCursor,
    hasMore: raw.hasMore,
  };
};

const editMessage = async (
  messageId: string,
  content: string
): Promise<Message> => {
  const response = await pATCHMessagesMessageId(messageId, { content });
  return toMessage(response.data.data);
};

const deleteMessage = async (messageId: string): Promise<Message> => {
  const response = await dELETEMessagesMessageId(messageId);
  return toMessage(response.data.data);
};

export const queryMessageService = {
  infiniteList: (conversationId: string) =>
    useInfiniteQuery({
      queryKey: messageKeys.conversation(conversationId),
      queryFn: ({ pageParam }) =>
        fetchMessages(conversationId, pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: !!conversationId,
    }),

  send: (conversationId: string) => {
    return useMutation({
      mutationFn: async (content: string): Promise<void> => {
        await Promise.race([
          getSocket().emitWithAck("message:send", { conversationId, content }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 5000)
          ),
        ]);
      },
    });
  },

  edit: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        messageId,
        content,
      }: {
        messageId: string;
        content: string;
      }) => editMessage(messageId, content),
      onSuccess: (updatedMessage) => {
        const key = messageKeys.conversation(updatedMessage.conversationId);
        queryClient.setQueryData<{
          pages: MessagePage[];
          pageParams: unknown[];
        }>(key, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === updatedMessage.id ? updatedMessage : m
              ),
            })),
          };
        });
      },
    });
  },

  delete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (messageId: string) => deleteMessage(messageId),
      onSuccess: (tombstone) => {
        const key = messageKeys.conversation(tombstone.conversationId);
        queryClient.setQueryData<{
          pages: MessagePage[];
          pageParams: unknown[];
        }>(key, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === tombstone.id ? tombstone : m
              ),
            })),
          };
        });
      },
    });
  },
};

export const messageService = {
  fetchMessages,
  editMessage,
  deleteMessage,
};
