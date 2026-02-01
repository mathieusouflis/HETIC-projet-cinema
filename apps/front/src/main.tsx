import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { setNavigateCallback } from "./lib/api";
// Import the generated route tree
// biome-ignore lint: Ts ignore needed
// @ts-ignore: Next line is generated
import { routeTree } from "./routeTree.gen";

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
if (!el) throw new Error("Could not find root element");

createRoot(el).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);