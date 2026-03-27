import { config } from "@packages/config";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { pOSTAuthRefresh } from "./generated";
import type { ApiClientConfig } from "./types";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (reason?: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
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
    // Cookies (accessToken + refreshToken) are sent automatically by the browser
    axios.defaults.withCredentials = true;

    // Response interceptor: handle 401 with silent token refresh via cookie
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (
          originalRequest?.url?.includes("/auth") &&
          !originalRequest?.url?.includes("/auth/me")
        ) {
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
            return new Promise<void>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => axios(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // The refresh token is in an httpOnly cookie — no explicit token needed
            await pOSTAuthRefresh();

            this.config.onTokenRefreshed();

            // Unblock queued requests — they will retry with the new accessToken cookie
            processQueue(null);

            return axios(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError as AxiosError);
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
