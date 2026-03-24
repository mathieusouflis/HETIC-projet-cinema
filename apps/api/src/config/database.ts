import { config } from "@packages/config";
import { logger } from "@packages/logger";

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
  const resolvedPort = Number(port);
  const sslmode = ssl ? "require" : "disable";
  const portSegment =
    config.env.NODE_ENV === "production" ? "" : `:${resolvedPort}`;
  const requireChannelBinding =
    config.env.NODE_ENV === "production" ? "&channel_binding=require" : "";
  const url = `postgresql://${user}:${password}@${host}${portSegment}/${database}?sslmode=${sslmode}${requireChannelBinding}`;
  logger.info(url);
  return url;
};

/**
 * Connection pool options for pg
 */
export const connectionOptions = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};
