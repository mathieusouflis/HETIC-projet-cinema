import { type GETContentsParams, gETContents } from "@packages/api-sdk";
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
};
