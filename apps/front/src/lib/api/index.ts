import { ApiClient } from "@packages/api-sdk";
import { useAuth } from "@/features/auth/stores/auth.store";

let navigateCallback: (() => void) | null = null;

// Export function for main.tsx to register router navigate
export function setNavigateCallback(callback: () => void) {
  navigateCallback = callback;
}

// Create singleton ApiClient.
// The access token is stored in an httpOnly cookie — no JS token management needed.
new ApiClient({
  onTokenRefreshed: () => {
    // Nothing to store — the new accessToken cookie is set by the server automatically.
    // If a WebSocket is open, it will reconnect with the new cookie on next handshake.
  },
  clearAuth: () => {
    useAuth.getState().clear();
  },
  onUnauthorized: () => {
    if (navigateCallback) {
      navigateCallback();
    }
  },
});

// Re-export everything from SDK for backward compatibility
export * from "@packages/api-sdk";
