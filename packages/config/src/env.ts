import dotenv from "dotenv";

dotenv.config({ path: "../../.env", debug: true });

export const env = {
  // Application Mode
  NODE_ENV: process.env.NODE_ENV || "development",

  // Backend Configuration
  backend: {
    port: process.env.BACKEND_PORT || 3000,
    host: process.env.BACKEND_HOST || "localhost",
    apiUrl: process.env.BACKEND_API_URL || "http://localhost:3000",
    version: 1,
  },

  // External API'S
  externalApi: {
    omdbApiKey: process.env.OMDB_API_KEY || "your_omdb_api_key_here",
    tmdbApiKey: process.env.TMDB_API_KEY || "your_tmdb_api_key_here",
  },

  // Frontend Configuration
  frontend: {
    port: process.env.FRONTEND_PORT || 3001,
    host: process.env.FRONTEND_HOST || "localhost",
    url: process.env.FRONTEND_URL || "http://localhost:3001",
    posthog: {
      key: process.env.VITE_PUBLIC_POSTHOG_KEY || "",
      host: process.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"
    }
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_DATABASE || "myapp",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "your_password_here",
    database: process.env.DB_DATABASE || "the_database",
    ssl: process.env.DB_SSL === "true",
  },

  // API Keys and Secrets
  API_SECRET_KEY: process.env.API_SECRET_KEY || "your_secret_key_here",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_here",

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3001",

  // Additional Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || "your_session_secret_here",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
};
