export type { IApiModule } from "./module-registry.js";

export { ModuleRegistry, moduleRegistry } from "./module-registry.js";
export { OpenAPISpecAggregator } from "./openapi-spec-aggregator.js";

export { getSharedRegistry, resetSharedRegistry } from "./shared-registry.js";

export { initializeZodOpenAPI, z } from "./zod-openapi.js";
