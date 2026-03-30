import {
  dELETEWatchlistContentId,
  dELETEWatchlistId,
  gETWatchlist,
  gETWatchlistContentId,
  type POSTWatchlistBody,
  type PUTWatchlistContentIdBody,
  type PUTWatchlistIdBody,
  pOSTWatchlist,
  pUTWatchlistContentId,
  pUTWatchlistId,
} from "@packages/api-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/stores/auth.store";
import { contentsKeys } from "../contents/keys";
import { usersKeys } from "../users/keys";
import { watchlistKeys } from "./keys";

const postWatchlist = async (data: POSTWatchlistBody) => {
  return await pOSTWatchlist(data);
};

const getWatchlistByContentId = async (id: string) => {
  return await gETWatchlistContentId(id);
};

const listWatchlist = async () => {
  return await gETWatchlist({
    limit: 0,
  });
};

const updateWatchlistByContentId = async (
  id: string,
  data: PUTWatchlistContentIdBody
) => {
  return await pUTWatchlistContentId(id, data);
};

const updateWatchlistById = async (id: string, data: PUTWatchlistIdBody) => {
  return await pUTWatchlistId(id, data);
};

const deleteWatchlistByContentId = async (contentId: string) => {
  await dELETEWatchlistContentId(contentId);
};

const deleteWatchlistById = async (id: string) => {
  await dELETEWatchlistId(id);
};

export const queryWatchlistService = {
  create: () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (params: POSTWatchlistBody) => postWatchlist(params),
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({
          queryKey: watchlistKeys.all(user?.id ?? ""),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: usersKeys.me(),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: contentsKeys.discoverAll(),
          refetchType: "all",
        });
        if (params.contentId) {
          queryClient.invalidateQueries({
            queryKey: contentsKeys.get(params.contentId),
            refetchType: "all",
          });
        }
      },
    });
  },

  getId: (id: string) => {
    const { user } = useAuth();
    return useQuery({
      queryFn: () => getWatchlistByContentId(id),
      queryKey: watchlistKeys.getId(user?.id ?? "", id),
      enabled: !!user?.id,
    });
  },

  list: () => {
    const { user } = useAuth();
    return useQuery({
      queryKey: watchlistKeys.all(user?.id ?? ""),
      queryFn: listWatchlist,
      enabled: !!user?.id,
    });
  },

  updateId: (id: string, data: PUTWatchlistIdBody) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => updateWatchlistById(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: watchlistKeys.all(user?.id ?? ""),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: usersKeys.me(),
          refetchType: "all",
        });
      },
    });
  },

  updateContentId: () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: PUTWatchlistContentIdBody;
      }) => updateWatchlistByContentId(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({
          queryKey: watchlistKeys.all(user?.id ?? ""),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: usersKeys.me(),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: contentsKeys.get(id),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: contentsKeys.discoverAll(),
          refetchType: "all",
        });
      },
    });
  },

  deleteContentId: () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ contentId }: { contentId: string }) =>
        deleteWatchlistByContentId(contentId),
      onSuccess: (_, { contentId }) => {
        queryClient.invalidateQueries({
          queryKey: watchlistKeys.all(user?.id ?? ""),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: usersKeys.me(),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: contentsKeys.get(contentId),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: contentsKeys.discoverAll(),
          refetchType: "all",
        });
      },
    });
  },

  deleteId: () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id }: { id: string; contentId?: string }) =>
        deleteWatchlistById(id),
      onSuccess: (_, { contentId }) => {
        queryClient.invalidateQueries({
          queryKey: watchlistKeys.all(user?.id ?? ""),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: usersKeys.me(),
          refetchType: "all",
        });
        if (contentId) {
          queryClient.invalidateQueries({
            queryKey: contentsKeys.get(contentId),
            refetchType: "all",
          });
        }
        queryClient.invalidateQueries({
          queryKey: contentsKeys.discoverAll(),
          refetchType: "all",
        });
      },
    });
  },
};

export const watchlistService = {
  create: (params: POSTWatchlistBody) => postWatchlist(params),
  getId: (id: string) => getWatchlistByContentId(id),
  updateId: (id: string, data: PUTWatchlistIdBody) =>
    updateWatchlistById(id, data),
  updateContentId: (id: string, data: PUTWatchlistContentIdBody) =>
    updateWatchlistByContentId(id, data),
  list: () => listWatchlist(),
  deleteContentId: (contentId: string) => deleteWatchlistByContentId(contentId),
  deleteId: (id: string) => deleteWatchlistById(id),
};
