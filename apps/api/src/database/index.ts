import { logger } from "@packages/logger";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { connectionOptions, getDatabaseUrl } from "../config/database";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ...connectionOptions,
});

pool.on("connect", () => {
  logger.info("🔌 PostgreSQL client connected");
});

pool.on("error", (err) => {
  logger.error(`PostgreSQL pool error: ${err.message}`);
});

export const db = drizzle(pool, { schema });

export { pool };

export type Database = typeof db;

export const closeDatabase = async (): Promise<void> => {
  await pool.end();
  logger.info("🔌 PostgreSQL pool closed");
};
