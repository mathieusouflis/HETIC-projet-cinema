// Helper function to safely get environment variables in both Node.js and browser environments
const getEnvVar = (
  key: string,
  defaultValue: string | number | boolean = ""
): string | number | boolean => {
  if (typeof process !== "undefined" && process?.env) {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
  }

  // @ts-expect-error - import.meta.env is available in Vite but not in Node
  if (typeof import.meta !== "undefined" && import.meta?.env) {
    // @ts-expect-error - import.meta.env is available in Vite but not in Node
    const value = import.meta.env[key];
    return value !== undefined ? value : defaultValue;
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
    host: getEnvVar("BACKEND_HOST", "localhost") as string,
    apiUrl: getEnvVar("BACKEND_API_URL", "http://localhost:3000") as string,
    version: 1,
  },

  externalApi: {
    omdbApiKey: getEnvVar("OMDB_API_KEY", "") as string,
    tmdbApiKey: getEnvVar("TMDB_API_KEY", "") as string,
  },

  frontend: {
    port: parseNumber(getEnvVar("FRONTEND_PORT", 3001), 3001),
    host: getEnvVar("FRONTEND_HOST", "localhost") as string,
    url: getEnvVar("FRONTEND_URL", "http://localhost:3001") as string,
    posthog: {
      key: getEnvVar("VITE_PUBLIC_POSTHOG_KEY", "") as string,
      host: getEnvVar(
        "VITE_PUBLIC_POSTHOG_HOST",
        "https://eu.i.posthog.com"
      ) as string,
    },
  },

  database: {
    host: getEnvVar("DB_HOST", "localhost") as string,
    port: parseNumber(getEnvVar("DB_PORT", 5432), 5432),
    name: getEnvVar("DB_DATABASE", "myapp") as string,
    user: getEnvVar("DB_USER", "postgres") as string,
    password: getEnvVar("DB_PASSWORD", "") as string,
    database: getEnvVar("DB_DATABASE", "the_database") as string,
    ssl: parseBool(getEnvVar("DB_SSL", false)),
  },

  API_SECRET_KEY: getEnvVar("API_SECRET_KEY", "") as string,
  JWT_SECRET: getEnvVar("JWT_SECRET", "") as string,

  CORS_ORIGIN: getEnvVar("CORS_ORIGIN", "http://localhost:3001") as string,

  SESSION_SECRET: getEnvVar("SESSION_SECRET", "") as string,
  COOKIE_SECURE: parseBool(getEnvVar("COOKIE_SECURE", false)),
};

export { getEnvVar };
