import type { GETPeoplesSearchParams } from "@packages/api-sdk";

export const peoplesKeys = {
  search: (params: GETPeoplesSearchParams) =>
    ["peoples", "search", params] as const,
};
