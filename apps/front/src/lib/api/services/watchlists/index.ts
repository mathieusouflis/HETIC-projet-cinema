import {
  gETWatchlistContentId,
  type PATCHWatchlistContentIdBody,
  type POSTWatchlistBody,
  pATCHWatchlistContentId,
  pOSTWatchlist,
} from "@packages/api-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { watchlistKeys } from "./keys";

const postWatchlist = async (data: POSTWatchlistBody) => {
  return await pOSTWatchlist(data);
};

const getWatchlistByContentId = async (id: string) => {
  return await gETWatchlistContentId(id);
};

const updateWatchlistByContentId = async (
  id: string,
  data: PATCHWatchlistContentIdBody
) => {
  return await pATCHWatchlistContentId(id, data);
};

export const queryWatchlistService = {
  create: (params: POSTWatchlistBody) =>
    useMutation({
      mutationFn: () => postWatchlist(params),
    }),
  getId: (id: string) =>
    useQuery({
      queryFn: () => getWatchlistByContentId(id),
      queryKey: watchlistKeys.getId(id),
    }),
  update: () =>
    useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: PATCHWatchlistContentIdBody;
      }) => updateWatchlistByContentId(id, data),
    }),
};

export const watchlistService = {
  create: (params: POSTWatchlistBody) => postWatchlist(params),
  getId: (id: string) => getWatchlistByContentId(id),
  update: (id: string, data: PATCHWatchlistContentIdBody) =>
    updateWatchlistByContentId(id, data),
};
