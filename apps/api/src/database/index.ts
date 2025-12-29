import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getDatabaseUrl, connectionOptions } from "../config/database.js";
import * as schema from "./schema.js";
import { log } from "@packages/logger";

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ...connectionOptions,
});

pool.on("connect", () => {
  log("✅ PostgreSQL client connected");
});

pool.on("error", (err) => {
  log(`❌ PostgreSQL pool error: ${err.message}`);
});

export const db = drizzle(pool, { schema });

export { pool };

export type Database = typeof db;

export const closeDatabase = async (): Promise<void> => {
  await pool.end();
  log("🔌 PostgreSQL pool closed");
};
