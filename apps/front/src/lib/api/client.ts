import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError;
        const status = axiosError?.response?.status;

        if (status === 401 || status === 403) {
          return false;
        }

        if (status && status >= 400 && status < 500) {
          return false;
        }

        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError;
        const status = axiosError?.response?.status;

        if (status === 401 || status === 403) {
          return false;
        }

        if (status && status >= 400 && status < 500) {
          return false;
        }

        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
  },
});
