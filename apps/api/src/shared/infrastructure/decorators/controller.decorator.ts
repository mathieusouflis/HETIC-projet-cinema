import "reflect-metadata";
import { METADATA_KEYS, type ControllerMetadata } from "./metadata.js";
import type { ControllerConstructor } from "./types.js";

interface ControllerOptions {
  tag: string;
  prefix?: string;
  description?: string;
}

/**
 * Controller decorator to set OpenAPI tags and route prefix
 */
export function Controller(options: ControllerOptions) {
  return function <T extends ControllerConstructor>(constructor: T): T {
    const metadata: ControllerMetadata = {
      tag: options.tag,
      prefix: options.prefix,
      description: options.description,
    };

    Reflect.defineMetadata(
      METADATA_KEYS.CONTROLLER_TAG,
      metadata,
      constructor.prototype,
    );

    return constructor;
  };
}
