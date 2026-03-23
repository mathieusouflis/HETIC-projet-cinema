// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://17960d9a9b5a17468256773aa03f9d71@o4511093282308096.ingest.de.sentry.io/4511093286109264",
  // Setting this option to true will send default PII data to Sentry.
  tracesSampleRate: 1.0,
  enableLogs: true,
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
