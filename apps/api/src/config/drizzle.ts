import { defineConfig } from "drizzle-kit";
import { databaseConfig } from "./database";

export const drizzleConfig = defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dbCredentials: {
    database: databaseConfig.database,
    user: databaseConfig.user,
    password: databaseConfig.password,
    host: databaseConfig.host,
    port:
      typeof databaseConfig.port === "string"
        ? parseInt(databaseConfig.port, 10)
        : databaseConfig.port,
    ssl: databaseConfig.ssl,
  },
});
