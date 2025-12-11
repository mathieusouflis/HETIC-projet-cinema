import dotenv from "dotenv";

dotenv.config({ path: "../../.env" , debug: true});

export const env = {
  // Application Mode
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Backend Configuration
  BACKEND_PORT: process.env.BACKEND_PORT || 3000,
  BACKEND_HOST: process.env.BACKEND_HOST || 'localhost',
  BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:3000',

  // Frontend Configuration
  FRONTEND_PORT: process.env.FRONTEND_PORT || 3001,
  FRONTEND_HOST: process.env.FRONTEND_HOST || 'localhost',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',

  // Database Configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'myapp',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'your_password_here',
  DB_DATABASE: process.env.DB_DATABASE || 'the_database',
  DB_SSL: process.env.DB_SSL === 'true',

  // API Keys and Secrets
  API_SECRET_KEY: process.env.API_SECRET_KEY || 'your_secret_key_here',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_here',

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001',

  // Additional Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'your_session_secret_here',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
};
