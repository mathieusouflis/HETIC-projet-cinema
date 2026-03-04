import { config } from "@packages/config";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: config.env.backend.apiUrl,
  withCredentials: true,
});
