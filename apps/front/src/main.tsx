import React from "react";
import { createRoot } from "react-dom/client";
// import { PostHogProvider } from "posthog-js/react";
import "./index.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";

// Import the generated route tree
// biome-ignore lint: Ts ignore needed
// @ts-ignore: Next line is generated
import { routeTree } from "./generated/routeTree.gen";
import { setNavigateCallback } from "./lib/api";

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
