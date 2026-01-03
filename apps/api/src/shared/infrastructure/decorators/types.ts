import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { BaseController } from '../base/BaseController.js';

export { BaseController };

export type RouteHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void> | void;

export type ControllerConstructor<T extends BaseController = BaseController> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for decorator flexibility with different controller constructors
  new (...args: any[]) => T;

export function isRouteHandler(value: unknown): value is RouteHandler {
  return typeof value === 'function';
}

export function isController(value: unknown): value is BaseController {
  return value instanceof BaseController;
}

export type MiddlewareStack = RequestHandler[];

export const AUTH_MIDDLEWARE_MARKER = '__AUTH__' as const;
export type AuthMiddlewareMarker = typeof AUTH_MIDDLEWARE_MARKER;

export type MiddlewareOrMarker = RequestHandler | AuthMiddlewareMarker;
