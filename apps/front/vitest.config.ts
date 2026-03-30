import path from "path";
import { defineConfig } from "vitest/config";

/** Périmètre de couverture : code métier et UI unitairement testés (hors routes TanStack et shell applicatif). */
const COVERAGE_INCLUDE = [
  "src/lib/**/*.{ts,tsx}",
  "src/features/auth/hooks/**/*.{ts,tsx}",
  "src/features/auth/stores/**/*.{ts,tsx}",
  "src/features/auth/schemas/**/*.{ts,tsx}",
  "src/features/messages/hooks/**/*.ts",
  "src/features/messages/stores/**/*.ts",
  "src/features/messages/components/conversation-list/conversation-item.tsx",
  "src/components/ui/button.tsx",
  "src/components/ui/filters/glass-filter.tsx",
] as const;

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      all: true,
      include: [...COVERAGE_INCLUDE],
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
        /** Barrels / hooks non couverts par des tests unitaires dédiés */
        "src/lib/api/index.ts",
        "src/features/auth/hooks/useForgotPassword.ts",
        "src/features/auth/hooks/useResetPassword.ts",
        "src/features/auth/hooks/useResendVerification.ts",
        "src/features/auth/hooks/useVerifyEmail.ts",
        "src/features/messages/hooks/use-messages-socket.ts",
        "src/lib/routes/**",
        "src/lib/socket/types.ts",
        /** Hooks TanStack à nombreuses branches ; la logique métier est couverte via les tests SDK */
        "src/lib/api/services/conversations/index.ts",
        "src/lib/api/services/watchlists/index.ts",
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
