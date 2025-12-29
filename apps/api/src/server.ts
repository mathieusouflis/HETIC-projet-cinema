import bodyParser from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { apiVersion1Router } from "./modules";

const { json, urlencoded } = bodyParser;

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .use("/api/v1", apiVersion1Router())
    .get("/status", (_, res) => {
      return res.json({ ok: true });
    });

  return app;
};
