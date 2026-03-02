import {
  dELETEWatchlistContentId,
  gETWatchlist,
  gETWatchlistContentId,
  type POSTWatchlistBody,
  type PUTWatchlistContentIdBody,
  pOSTWatchlist,
  pUTWatchlistContentId,
} from "@packages/api-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/stores/auth.store";
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

const deleteWatchlistByContentId = async (contentId: string) => {
  await dELETEWatchlistContentId(contentId);
};

export const queryWatchlistService = {
  create: (params: POSTWatchlistBody) =>
    useMutation({
      mutationFn: () => postWatchlist(params),
    }),
  getId: (id: string) => {
    const { user } = useAuth();
    return useQuery({
      queryFn: () => getWatchlistByContentId(id),
      queryKey: watchlistKeys.getId(user?.id ?? "", id),
    });
  },
  list: () => {
    const { user } = useAuth();
    return useQuery({
      queryKey: watchlistKeys.all(user?.id ?? ""),
      queryFn: listWatchlist,
    });
  },
  update: () =>
    useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: PUTWatchlistContentIdBody;
      }) => updateWatchlistByContentId(id, data),
    }),
  deleteContentId: (contentId: string) =>
    useMutation({
      mutationFn: () => deleteWatchlistByContentId(contentId),
    }),
};

export const watchlistService = {
  create: (params: POSTWatchlistBody) => postWatchlist(params),
  getId: (id: string) => getWatchlistByContentId(id),
  update: (id: string, data: PUTWatchlistContentIdBody) =>
    updateWatchlistByContentId(id, data),
  list: () => listWatchlist(),
  deleteContentId: (contentId: string) => deleteWatchlistByContentId(contentId),
};
