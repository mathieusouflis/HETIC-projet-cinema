import { config } from "@packages/config";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: config.env.backend.apiUrl,
  withCredentials: true,
  paramsSerializer: (params) => {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        parts.push(`${key}=[${value.join(",")}]`);
      } else {
        parts.push(`${key}=${value}`);
      }
    }
    return parts.join("&");
  },
});
