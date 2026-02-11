import { type GETContentsParams, gETContents } from "@packages/api-sdk";

export const contentService = {
  discover: async (props: GETContentsParams) => {
    const response = await gETContents({
      ...props,
    });
    return response.data.data;
  },
};
