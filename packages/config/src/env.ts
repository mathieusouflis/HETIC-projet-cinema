// Helper function to safely get environment variables in both Node.js and browser environments
const getEnvVar = (
  key: string,
  defaultValue: string | number | boolean = ""
): string | number | boolean => {
  if (typeof process !== "undefined" && process?.env) {
    const value = process.env[key];
    return value === undefined ? defaultValue : value;
  }

  // @ts-expect-error - import.meta.env is available in Vite but not in Node
  if (typeof import.meta !== "undefined" && import.meta?.env) {
    // @ts-expect-error - import.meta.env is available in Vite but not in Node
    const value = import.meta.env[key];
    return value === undefined ? defaultValue : value;
  }

  return defaultValue;
};

const parseBool = (value: string | number | boolean): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
};

const parseNumber = (
  value: string | number | boolean,
  fallback: number
): number => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

export const env = {
  NODE_ENV: getEnvVar("NODE_ENV", "development") as string,

  backend: {
    port: parseNumber(getEnvVar("BACKEND_PORT", 3000), 3000),
    apiUrl: getEnvVar(
      "VITE_BACKEND_API_URL",
      "http://localhost:3000"
    ) as string,
    cookieDomain: getEnvVar("COOKIE_DOMAIN", "localhost") as string,
    version: 1,
  },

  externalApi: {
    tmdbApiKey: getEnvVar("TMDB_API_KEY", "") as string,
  },

  frontend: {
    url: getEnvVar("FRONTEND_URL", "http://localhost:3001") as string,
  },

  database: {
    host: getEnvVar("DB_HOST", "localhost") as string,
    port: parseNumber(getEnvVar("DB_PORT", 5432), 5432),
    database: getEnvVar("DB_DATABASE", "myapp") as string,
    user: getEnvVar("DB_USER", "postgres") as string,
    password: getEnvVar("DB_PASSWORD", "") as string,
    ssl: parseBool(getEnvVar("DB_SSL", false)),
  },

  JWT_SECRET: getEnvVar("JWT_SECRET", "") as string,
  COOKIE_SECURE: parseBool(getEnvVar("COOKIE_SECURE", false)),

  mailgun: {
    apiKey: getEnvVar("MAILGUN_API_KEY", "") as string,
    apiUrl: getEnvVar("MAILGUN_API_URL", "") as string,
    baseUrl: getEnvVar("MAILGUN_BASE_URL", "") as string,
  },
};

export { getEnvVar };
