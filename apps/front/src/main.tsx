import React from "react";
import { createRoot } from "react-dom/client";
// import { PostHogProvider } from "posthog-js/react";
import App from "./app";
import "./index.css";

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
      <App />
      {/*</PostHogProvider>*/}
    </React.StrictMode>
  );
} else {
  throw new Error("Could not find root element");
}
