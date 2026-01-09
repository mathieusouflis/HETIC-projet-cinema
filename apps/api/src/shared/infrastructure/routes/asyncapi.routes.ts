import { Router } from "express";
import { asyncAPIGenerator } from "../documentation/asyncapi-generator.js";

/**
 * Create router for AsyncAPI documentation endpoints
 * Provides JSON and YAML documentation for WebSocket API
 */
export function createAsyncAPIRouter(): Router {
  const router = Router();

  /**
   * Get AsyncAPI specification as JSON
   * @route GET /asyncapi.json
   */
  router.get("/asyncapi.json", (req, res) => {
    const spec = asyncAPIGenerator.generateSpec({
      title: "Cinema WebSocket API",
      version: "1.0.0",
      description: "Real-time WebSocket API for cinema application",
      serverUrl: `ws://${req.get("host") || "localhost:5001"}`,
    });

    res.json(spec);
  });

  return router;
}
