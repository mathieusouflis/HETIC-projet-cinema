import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      /** Ne compte que le code couvert par les tests actuels (pas les écrans / routes). */
      all: true,
      include: [
        "src/lib/**/*.{ts,tsx}",
        "src/features/auth/**/*.{ts,tsx}",
        "src/features/messages/**/*.{ts,tsx}",
        "src/components/ui/button.tsx",
        "src/components/ui/filters/glass-filter.tsx",
      ],
      exclude: [
        "**/node_modules/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.mock.ts",
        "src/vite-env.d.ts",
        "src/main.tsx",
        "src/routeTree.gen.ts",
        /** Fichiers non couverts par les tests (hors périmètre du rapport « cœur »). */
        "src/features/auth/components/**",
        "src/features/auth/hooks/useForgotPassword.ts",
        "src/features/auth/hooks/useResetPassword.ts",
        "src/features/auth/hooks/useResendVerification.ts",
        "src/features/auth/hooks/useVerifyEmail.ts",
        "src/features/messages/index.tsx",
        "src/features/messages/types.ts",
        "src/features/messages/hooks/use-messages-socket.ts",
        "src/features/messages/components/messages-layout.tsx",
        "src/features/messages/components/new-conversation-dialog.tsx",
        "src/features/messages/components/chat/**",
        "src/features/messages/components/conversation-list/index.tsx",
        "src/features/messages/components/conversation-list/conversation-item-skeleton.tsx",
        "src/lib/routes/**",
        "src/lib/api/index.ts",
        "src/lib/socket/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@packages/api-sdk": path.resolve(
        __dirname,
        "../../packages/api-sdk/src/index.ts"
      ),
    },
  },
});
