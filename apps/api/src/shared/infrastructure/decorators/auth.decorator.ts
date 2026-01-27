import "reflect-metadata";
import type { RequestHandler } from "express";
import { AUTH_MIDDLEWARE_MARKER, type MiddlewareOrMarker } from "./types.js";

const MIDDLEWARES_METADATA_KEY = Symbol("route:middlewares");

export interface MiddlewaresMetadata {
  middlewares: MiddlewareOrMarker[];
}

/**
 * Decorator to add custom middlewares to a route
 *
 * Allows you to add any Express middleware(s) to a specific route.
 * Middlewares will be applied in the order they are specified.
 *
 * @param middlewares - One or more Express middleware functions
 */
export function Middlewares(...middlewares: RequestHandler[]) {
  return (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor
  ): void => {
    const key = `${MIDDLEWARES_METADATA_KEY.toString()}_${propertyKey}`;

    const metadata: MiddlewaresMetadata = {
      middlewares,
    };

    Reflect.defineMetadata(key, metadata, target);
  };
}

/**
 * Decorator to mark a route as protected (requires authentication)
 *
 * This is a convenience decorator that applies the auth middleware.
 * It's equivalent to @Middlewares(authMiddleware) but more expressive.
 */
export function Protected() {
  return (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor
  ): void => {
    const key = `${MIDDLEWARES_METADATA_KEY.toString()}_${propertyKey}`;

    const metadata: MiddlewaresMetadata = {
      middlewares: [AUTH_MIDDLEWARE_MARKER],
    };

    Reflect.defineMetadata(key, metadata, target);
  };
}

export function getMiddlewaresMetadata(
  target: object,
  methodName: string
): MiddlewaresMetadata | undefined {
  const key = `${MIDDLEWARES_METADATA_KEY.toString()}_${methodName}`;
  return Reflect.getMetadata(key, target);
}
