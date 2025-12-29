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
  const { host, port, user, password, database } = databaseConfig;
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

/**
 * Connection pool options for pg
 */
export const connectionOptions = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
