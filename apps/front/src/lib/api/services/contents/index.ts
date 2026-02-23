import {
  type GETContentsIdParams,
  type GETContentsParams,
  gETContents,
  gETContentsId,
} from "@packages/api-sdk";
import { useQuery } from "@tanstack/react-query";
import { contentsKeys } from "./keys";

export const contentService = {
  discover: (props: GETContentsParams) => {
    return useQuery({
      queryFn: async () => {
        const response = await gETContents({
          ...props,
        });
        return response.data.data;
      },
      queryKey: [contentsKeys.discover(props)],
    });
  },
  get: (contentId: string, params?: GETContentsIdParams) => {
    return useQuery({
      queryFn: async () => {
        const response = await gETContentsId(contentId, params);
        return response.data.data;
      },
      queryKey: [contentsKeys.get(contentId, params)],
    });
  },
};
