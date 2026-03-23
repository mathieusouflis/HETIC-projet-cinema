import {
  type GETConversations200DataItem,
  type GETConversationsId200Data,
  gETConversations,
  gETConversationsId,
  type POSTConversations201Data,
  pOSTConversations,
  pOSTConversationsIdRead,
} from "@packages/api-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useAuth } from "@/features/auth/stores/auth.store";
import type { Conversation } from "@/features/messages/types";
import { conversationKeys } from "./keys";

export function toConversation(
  item: GETConversations200DataItem | GETConversationsId200Data
): Conversation {
  return {
    id: item.id,
    type: "direct",
    name: item.name ?? null,
    avatarUrl: item.avatarUrl ?? null,
    createdBy: item.createdBy ?? null,
    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
    otherParticipant: {
      id: item.otherParticipant.id,
      username: item.otherParticipant.username,
      avatarUrl: item.otherParticipant.avatarUrl ?? null,
    },
    lastMessage: item.lastMessage
      ? {
          id: item.lastMessage.id,
          content: item.lastMessage.content ?? null,
          isDeleted: item.lastMessage.isDeleted,
          createdAt: item.lastMessage.createdAt ?? null,
          authorId: item.lastMessage.authorId,
        }
      : null,
    unreadCount: item.unreadCount,
  };
}

const listConversations = async (): Promise<Conversation[]> => {
  const response = await gETConversations();
  return response.data.data.map(toConversation);
};

const getConversation = async (id: string): Promise<Conversation> => {
  const response = await gETConversationsId(id);
  return toConversation(response.data.data);
};

const createConversation = async (
  friendId: string
): Promise<Pick<POSTConversations201Data, "id">> => {
  const response = await pOSTConversations({ friendId });
  return { id: response.data.data.id };
};

const markConversationRead = async (id: string): Promise<void> => {
  await pOSTConversationsIdRead(id);
};

export const queryConversationService = {
  list: () => {
    const { user } = useAuth();
    return useQuery({
      queryKey: conversationKeys.all(user?.id ?? ""),
      queryFn: listConversations,
      enabled: !!user?.id,
    });
  },

  get: (id: string) => {
    const { user } = useAuth();
    return useQuery({
      queryKey: conversationKeys.detail(user?.id ?? "", id),
      queryFn: () => getConversation(id),
      enabled: !!user?.id && !!id,
    });
  },

  create: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (friendId: string) => createConversation(friendId),
      onSuccess: () => {
        const userId = useAuth.getState().user?.id ?? "";
        queryClient.invalidateQueries({
          queryKey: conversationKeys.all(userId),
        });
      },
    });
  },

  markRead: () => {
    const queryClient = useQueryClient();

    const pendingIds = useRef(new Set<string>());

    return useMutation({
      mutationFn: async (id: string) => {
        if (pendingIds.current.has(id)) {
          return;
        }
        pendingIds.current.add(id);
        try {
          await markConversationRead(id);
        } finally {
          pendingIds.current.delete(id);
        }
      },

      onSuccess: (_data, id) => {
        const userId = useAuth.getState().user?.id ?? "";
        queryClient.setQueryData<Conversation[]>(
          conversationKeys.all(userId),
          (old) =>
            old?.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)) ?? old
        );
      },
    });
  },
};

export const conversationService = {
  list: listConversations,
  get: getConversation,
  create: createConversation,
  markRead: markConversationRead,
};
