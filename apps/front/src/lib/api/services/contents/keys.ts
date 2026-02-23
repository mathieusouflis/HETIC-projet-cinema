import type { GETContentsIdParams, GETContentsParams } from "@packages/api-sdk";

const BASEKEY = "contents";
export const contentsKeys = {
  discover: (params: GETContentsParams) => [
    BASEKEY,
    "discover",
    ...Object.values(params),
  ],
  get: (contentId: string, params?: GETContentsIdParams) => [
    BASEKEY,
    "get",
    contentId,
    params,
  ],
};
