import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

class OpenApi {
  private registry: OpenAPIRegistry;
  constructor() {
    this.registry = new OpenAPIRegistry()
  }

  getRegistry() {
    return this.registry;
  }
}

export const openApi = new OpenApi();
