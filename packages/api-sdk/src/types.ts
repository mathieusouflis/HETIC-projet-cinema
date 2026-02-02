/**
 * API Client Configuration Interface
 * Provides callbacks for token management and authentication flow
 */
export interface ApiClientConfig {
  /**
   * Get the current access token
   * Called before each request to inject the token into Authorization header
   */
  getAccessToken: () => string | null;

  /**
   * Called when token refresh succeeds
   * @param token The new access token
   */
  onTokenRefreshed: (token: string) => void;

  /**
   * Called to clear authentication state
   * Invoked when refresh fails
   */
  clearAuth: () => void;

  /**
   * Called when user is unauthorized and cannot be refreshed
   * Typically triggers redirect to login
   */
  onUnauthorized: () => void;
}
