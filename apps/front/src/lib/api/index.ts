import { ApiClient } from "@packages/api-sdk";
import { useAuth } from "@/features/auth/stores/auth.store";

let navigateCallback: (() => void) | null = null;

// Export function for main.tsx to register router navigate
export function setNavigateCallback(callback: () => void) {
  navigateCallback = callback;
}

// Create singleton ApiClient with auth callbacks
new ApiClient({
  getAccessToken: () => useAuth.getState().accessToken,
  onTokenRefreshed: (token: string) => {
    useAuth.getState().setAccessToken(token);
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
