import {
  type GETContentsIdParams,
  type GETContentsParams,
  gETContents,
  gETContentsId,
} from "@packages/api-sdk";
import { useQuery } from "@tanstack/react-query";
import { contentsKeys } from "./keys";

const discover = async (props: GETContentsParams) => {
  const response = await gETContents({ ...props });
  return response.data.data;
};

const get = async (contentId: string, params?: GETContentsIdParams) => {
  const response = await gETContentsId(contentId, params);
  return response.data.data;
};

export const queryContentService = {
  discover: (props: GETContentsParams) =>
    useQuery({
      queryKey: contentsKeys.discover(props),
      queryFn: () => contentService.discover(props),
    }),

  get: (contentId: string, params?: GETContentsIdParams) =>
    useQuery({
      queryKey: contentsKeys.get(contentId, params),
      queryFn: () => contentService.get(contentId, params),
    }),
};

export const contentService = {
  discover,
  get,
};
