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

  updateId: (id: string, data: PUTWatchlistIdBody) =>
    useMutation({
      mutationFn: () => updateWatchlistById(id, data),
    }),
  updateContentId: () =>
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
  deleteId: (id: string) =>
    useMutation({
      mutationFn: () => dELETEWatchlistId(id),
    }),
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
