import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

class SharedOpenAPIRegistry {
  private static instance: SharedOpenAPIRegistry;
  private registry: OpenAPIRegistry;

  private constructor() {
    this.registry = new OpenAPIRegistry();

    this.registry.registerComponent("securitySchemes", "BearerAuth", {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Enter your JWT token in the format: Bearer <token>",
    });
  }

  public static getInstance(): SharedOpenAPIRegistry {
    if (!SharedOpenAPIRegistry.instance) {
      SharedOpenAPIRegistry.instance = new SharedOpenAPIRegistry();
    }
    return SharedOpenAPIRegistry.instance;
  }

  public getRegistry(): OpenAPIRegistry {
    return this.registry;
  }

  public reset(): void {
    this.registry = new OpenAPIRegistry();

    this.registry.registerComponent("securitySchemes", "BearerAuth", {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Enter your JWT token in the format: Bearer <token>",
    });
  }
}

export const getSharedRegistry = (): OpenAPIRegistry => {
  return SharedOpenAPIRegistry.getInstance().getRegistry();
};

export const resetSharedRegistry = (): void => {
  SharedOpenAPIRegistry.getInstance().reset();
};
