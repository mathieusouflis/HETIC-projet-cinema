import {
  dELETEFriendshipsId,
  type GETFriendships200DataItem,
  type GETFriendshipsStatus,
  gETFriendships,
  type PATCHFriendshipsIdBodyStatus,
  pATCHFriendshipsId,
  pOSTFriendshipsUserId,
} from "@packages/api-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/stores/auth.store";
import { friendshipKeys } from "./keys";

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string | null;
  updatedAt: string | null;
}

function toFriendship(item: GETFriendships200DataItem): Friendship {
  return {
    id: item.id,
    userId: item.userId,
    friendId: item.friendId,
    status: item.status,
    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
  };
}

const listFriendships = async (
  status?: GETFriendshipsStatus
): Promise<Friendship[]> => {
  const response = await gETFriendships(status ? { status } : undefined);
  return response.data.data.map(toFriendship);
};

const sendRequest = async (userId: string): Promise<Friendship> => {
  const response = await pOSTFriendshipsUserId(userId);
  return toFriendship(response.data.data as GETFriendships200DataItem);
};

const respondToRequest = async (
  id: string,
  status: PATCHFriendshipsIdBodyStatus
): Promise<void> => {
  await pATCHFriendshipsId(id, { status });
};

const removeFriendship = async (id: string): Promise<void> => {
  await dELETEFriendshipsId(id);
};

export const queryFriendshipService = {
  list: (status?: GETFriendshipsStatus) => {
    const { user } = useAuth();
    return useQuery({
      queryKey: status ? friendshipKeys.byStatus(status) : friendshipKeys.all(),
      queryFn: () => listFriendships(status),
      enabled: !!user?.id,
    });
  },

  send: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (userId: string) => sendRequest(userId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: friendshipKeys.all() });
      },
    });
  },

  respond: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        id,
        status,
      }: {
        id: string;
        status: PATCHFriendshipsIdBodyStatus;
      }) => respondToRequest(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: friendshipKeys.all() });
      },
    });
  },

  remove: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => removeFriendship(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: friendshipKeys.all() });
      },
    });
  },
};

export const friendshipService = {
  list: listFriendships,
  send: sendRequest,
  respond: respondToRequest,
  remove: removeFriendship,
};
