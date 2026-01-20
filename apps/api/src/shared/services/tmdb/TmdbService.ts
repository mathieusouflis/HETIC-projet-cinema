import { config } from "@packages/config";
import { ITmdbService } from "./ITmdbService";
import { ServerError } from "../../errors/ServerError";

export class TmdbService implements ITmdbService {
  private apiKey = config.env.externalApi.tmdbApiKey;
  private lang: "en_EN" | "fr_FR";
  private version: number;
  private baseUrl: string;

  constructor(lang: "en_EN" | "fr_FR" = "fr_FR", version: number = 3) {
    this.lang = lang;
    this.version = version;
    this.baseUrl = `https://api.themoviedb.org/`;
  }

  async request<T>(
    method: "GET",
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const url = `${this.baseUrl}${this.version}/${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${this.apiKey}&language=${this.lang}`;
    let paramsUrl: string = "";
    if (params) {
      paramsUrl = Object.keys(params).reduce((acc, key) => {
        return `${acc}&${key}=${params[key]}`;
      }, "");
    }
    const response = await fetch(url + paramsUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new ServerError();
    }
    return response.json() as Promise<T>;
  }
}
