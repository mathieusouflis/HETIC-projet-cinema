import {
  type GETPeoplesSearchParams,
  gETPeoplesSearch,
} from "@packages/api-sdk";
import { useQuery } from "@tanstack/react-query";
import { peoplesKeys } from "./keys";

const search = async (params: GETPeoplesSearchParams) => {
  const response = await gETPeoplesSearch(params);
  return response.data.data;
};

export const peoplesService = { search };

export const queryPeoplesService = {
  search: (params: GETPeoplesSearchParams) =>
    useQuery({
      queryKey: peoplesKeys.search(params),
      queryFn: () => peoplesService.search(params),
      enabled: params.query.trim().length > 0,
    }),
};
