import { config } from "@packages/config";

export const databaseConfig = {
  host: config.env.database.host,
  port: config.env.database.port,
  database: config.env.database.database,
  user: config.env.database.user,
  password: config.env.database.password,
    ssl: config.env.database.ssl
};
