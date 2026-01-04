import "reflect-metadata";
import { z } from "zod";
import { METADATA_KEYS, type ResponseMetadata } from "./metadata.js";

/**
 * Define an OpenAPI response for a route
 *
 * @example
 * ```ts
 * @ApiResponse(200, 'User created successfully', createSuccessResponse(userSchema))
 * @ApiResponse(400, 'Invalid input')
 * @Post('/users')
 * async createUser() {}
 * ```
 */
export function ApiResponse(
  statusCode: number,
  description: string,
  schema?: z.ZodSchema,
) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor,
  ): void {
    const key = `${METADATA_KEYS.OPENAPI_RESPONSES.toString()}_${propertyKey}`;

    const responses: ResponseMetadata[] =
      Reflect.getMetadata(key, target) || [];

    responses.push({
      statusCode,
      description,
      schema,
    });

    Reflect.defineMetadata(key, responses, target);
  };
}
