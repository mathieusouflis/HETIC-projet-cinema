export interface ITmdbService {
  request<T>(method: string, endpoint: string, params?: Record<string, string>): Promise<T>;
}
