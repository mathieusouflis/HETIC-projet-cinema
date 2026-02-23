import type { GETContentsIdParams, GETContentsParams } from "@packages/api-sdk";

export const contentsKeys = {
  discover: (params: GETContentsParams) => [
    "discover",
    ...Object.values(params),
  ],
  get: (contentId: string, params?: GETContentsIdParams) => [
    "get",
    contentId,
    params,
  ],
};
