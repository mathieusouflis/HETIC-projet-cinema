import type { GETContentsIdParams, GETContentsParams } from "@packages/api-sdk";

const BASEKEY = "contents";
export const contentsKeys = {
  all: () => [BASEKEY] as const,
  discoverAll: () => [BASEKEY, "discover"] as const,
  discover: (params: GETContentsParams) =>
    [BASEKEY, "discover", params] as const,
  get: (contentId: string, params?: GETContentsIdParams) =>
    [BASEKEY, "get", contentId, params] as const,
};
