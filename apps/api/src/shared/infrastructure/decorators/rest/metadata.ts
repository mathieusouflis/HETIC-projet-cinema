import "reflect-metadata";
import type { z } from "zod";

export const METADATA_KEYS = {
  CONTROLLER_TAG: Symbol("controller:tag"),
  CONTROLLER_PREFIX: Symbol("controller:prefix"),
  ROUTES: Symbol("routes"),
  ROUTE_VALIDATION: Symbol("route:validation"),
  OPENAPI_RESPONSES: Symbol("openapi:responses"),
  OPENAPI_SUMMARY: Symbol("openapi:summary"),
  OPENAPI_DESCRIPTION: Symbol("openapi:description"),
} as const;

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface ControllerMetadata {
  tag: string;
  prefix?: string;
  description?: string;
}

export interface RouteMetadata {
  method: HttpMethod;
  path: string;
  methodName: string;
  summary?: string;
  description?: string;
}

export interface ValidationMetadata {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}

export interface ResponseMetadata {
  statusCode: number;
  description: string;
  schema?: z.ZodSchema;
}

export class MetadataStorage {
  static getRoutes(target: object): RouteMetadata[] {
    return Reflect.getMetadata(METADATA_KEYS.ROUTES, target) || [];
  }

  static addRoute(target: object, route: RouteMetadata): void {
    const routes = MetadataStorage.getRoutes(target);
    routes.push(route);
    Reflect.defineMetadata(METADATA_KEYS.ROUTES, routes, target);
  }

  static getControllerMetadata(target: object): ControllerMetadata | undefined {
    return Reflect.getMetadata(METADATA_KEYS.CONTROLLER_TAG, target);
  }
}
