import React from "react";
import { createRoot } from "react-dom/client";
// import { PostHogProvider } from "posthog-js/react";
import "./index.css";
import * as Sentry from "@sentry/react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { setNavigateCallback } from "./lib/api";
// Import the generated route tree
// biome-ignore lint: Ts ignore needed
// @ts-ignore: Next line is generated
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the navigate callback with the SDK
setNavigateCallback(() => router.navigate({ to: "/login" }));

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

Sentry.init({
  dsn: "https://b84069dfdcd0279e8ca4c72b163bd7e2@o4511093282308096.ingest.de.sentry.io/4511093329952848",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  enableLogs: true,
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", "http://localhost:3000/"],
});

const el = document.getElementById("root");
if (el) {
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      {/*<PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: "2025-05-24",
          capture_exceptions: true,
          debug: import.meta.env.NODE_ENV === "development",
        }}
      >*/}
      <RouterProvider router={router} />
      {/*</PostHogProvider>*/}
    </React.StrictMode>
  );
} else {
  throw new Error("Could not find root element");
}
