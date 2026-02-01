import { config } from "@packages/config";
import { ServerError } from "../../errors/server-error";
import type { ITmdbService } from "./i-tmdb-service";

export class TmdbService implements ITmdbService {
  private apiKey = config.env.externalApi.tmdbApiKey;
  private lang: "en_EN" | "fr_FR";
  private version: number;
  private baseUrl: string;

  constructor(lang: "en_EN" | "fr_FR" = "fr_FR", version = 3) {
    this.lang = lang;
    this.version = version;
    this.baseUrl = "https://api.themoviedb.org/";
  }

  async request<T>(
    method: "GET",
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    try {
      const url = new URL(`${this.version}/${endpoint}`, this.baseUrl);
      url.searchParams.set("language", this.lang);

      if (params) {
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.set(key, value);
        }
      }

      const response = await fetch(url.toString(), {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ServerError(
          `TMDB API request failed: ${method} ${endpoint} - Status ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
        );
      }
      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }
      throw new ServerError(
        `TMDB API request failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
