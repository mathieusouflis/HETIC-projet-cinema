import { config } from "@packages/config";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { pOSTAuthRefresh } from "./generated";
import type { ApiClientConfig } from "./types";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string) => void;
  reject: (reason?: AxiosError) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || undefined);
    }
  });
  failedQueue = [];
};

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    axios.defaults.baseURL = `${config.env.backend.apiUrl}/api/v1`;
    axios.defaults.withCredentials = true;

    axios.interceptors.request.use(
      (requestConfig: InternalAxiosRequestConfig) => {
        const token = this.config.getAccessToken();

        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        return requestConfig;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: handle 401 with token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (originalRequest?.url?.includes("/auth/refresh")) {
          return Promise.reject(error);
        }

        // Handle 401 unauthorized
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          // If already refreshing, queue this request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (token) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return axios(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const response = await pOSTAuthRefresh();
            const newAccessToken = response.data.data.accessToken;

            this.config.onTokenRefreshed(newAccessToken);

            // Process queued requests with new token
            processQueue(null, newAccessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed: clear auth and notify
            processQueue(refreshError as AxiosError, null);
            this.config.clearAuth();
            this.config.onUnauthorized();

            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }
}
