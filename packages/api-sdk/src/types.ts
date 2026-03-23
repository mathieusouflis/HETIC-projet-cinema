/**
 * API Client Configuration Interface
 * Provides callbacks for authentication lifecycle events.
 * The access token is managed entirely via httpOnly cookies — no JS token access needed.
 */
export interface ApiClientConfig {
  /**
   * Called when token refresh succeeds.
   * Use this to trigger any post-refresh side effects (e.g. reconnect WebSocket).
   */
  onTokenRefreshed: () => void;

  /**
   * Called to clear authentication state (e.g. Zustand store).
   * Invoked when refresh fails.
   */
  clearAuth: () => void;

  /**
   * Called when user is unauthorized and cannot be refreshed.
   * Typically triggers redirect to login.
   */
  onUnauthorized: () => void;
}
