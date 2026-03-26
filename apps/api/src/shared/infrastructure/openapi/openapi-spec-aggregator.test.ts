import { describe, expect, it } from "vitest";
import { OpenAPISpecAggregator } from "./openapi-spec-aggregator.js";
import { getSharedRegistry, resetSharedRegistry } from "./shared-registry.js";
import { z } from "./zod-openapi.js";

describe("OpenAPISpecAggregator", () => {
  it("should generate a valid base OpenAPI spec", () => {
    resetSharedRegistry();
    const aggregator = new OpenAPISpecAggregator();

    const spec = aggregator.generateSpec();

    expect(spec.openapi).toBe("3.0.0");
    expect(spec.info).toMatchObject({
      version: "1.0.0",
      title: "Cinema API",
      description: "Comprehensive API documentation for the Cinema application",
    });
    expect(spec.servers).toEqual([
      {
        url: "/api/v1",
        description: "API Version 1",
      },
    ]);
  });

  it("should include shared BearerAuth security scheme in generated components", () => {
    resetSharedRegistry();
    const aggregator = new OpenAPISpecAggregator();

    const spec = aggregator.generateSpec();

    expect(spec.components?.securitySchemes).toMatchObject({
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    });
  });

  it("should reflect newly registered shared schemas", () => {
    resetSharedRegistry();
    const registry = getSharedRegistry();
    registry.register("HealthCheck", z.object({ status: z.string() }));

    const aggregator = new OpenAPISpecAggregator();
    const spec = aggregator.generateSpec();

    expect(spec.components?.schemas).toHaveProperty("HealthCheck");
  });
});
