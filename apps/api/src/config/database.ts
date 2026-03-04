import { config } from "@packages/config";

/**
 * Database configuration object
 * Contains all connection parameters for PostgreSQL
 */
export const databaseConfig = {
  host: config.env.database.host,
  port: config.env.database.port,
  database: config.env.database.database,
  user: config.env.database.user,
  password: config.env.database.password,
  ssl: config.env.database.ssl,
};

/**
 * Generate PostgreSQL connection URL from configuration
 * @returns PostgreSQL connection string
 */
export const getDatabaseUrl = (): string => {
  const { host, port, user, password, database, ssl } = databaseConfig;
  const resolvedPort = Number(port) || 3000;
  return `postgresql://${user}:${password}@${host}${config.env.NODE_ENV === "production" ? "" : `:${resolvedPort}`}/${database}?sslmode=${ssl ? "required" : ""}${config.env.NODE_ENV === "production" && "&channel_binding=require"}`;
};

/**
 * Connection pool options for pg
 */
export const connectionOptions = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
