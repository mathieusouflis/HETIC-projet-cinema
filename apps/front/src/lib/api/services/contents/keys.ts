import type { GETContentsParams } from "@packages/api-sdk";

export const contentsKeys = {
  discover: (params: GETContentsParams) => [
    "discover",
    ...Object.values(params),
  ],
};
