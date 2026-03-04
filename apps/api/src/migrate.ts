import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDatabase, db } from "./database/index.js";

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    return;
  } catch (error) {
    const isConnRefused =
      error instanceof Error &&
      (error.message.includes("ECONNREFUSED") ||
        error.message.includes("ENOTFOUND") ||
        (error as NodeJS.ErrnoException).code === "ECONNREFUSED");

    if (!isConnRefused) {
      throw error;
    }
  }
}

try {
  await runMigrations();
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  await closeDatabase();
}
