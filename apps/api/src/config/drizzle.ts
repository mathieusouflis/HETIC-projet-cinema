import { config } from "@packages/config";
import { defineConfig } from "drizzle-kit";
import { databaseConfig, getDatabaseUrl } from "./database";

export const drizzleConfig = defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dbCredentials:
    config.env.NODE_ENV === "production"
      ? {
          url: getDatabaseUrl(),
        }
      : {
          database: databaseConfig.database,
          user: databaseConfig.user,
          password: databaseConfig.password,
          host: databaseConfig.host,
          port:
            typeof databaseConfig.port === "string"
              ? Number.parseInt(databaseConfig.port, 10)
              : databaseConfig.port,
          ssl: databaseConfig.ssl,
        },
});
