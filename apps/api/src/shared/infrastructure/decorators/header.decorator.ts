import "reflect-metadata";
import type { Request, Response, NextFunction, RequestHandler } from "express";

const REQUIRED_HEADERS_METADATA_KEY = Symbol("route:requiredHeaders");
const SET_HEADERS_METADATA_KEY = Symbol("route:setHeaders");
const COOKIE_METADATA_KEY = Symbol("route:cookie");

export interface RequiredHeadersMetadata {
  headers: string[];
}

export interface SetHeadersMetadata {
  headers: Array<{
    name: string;
    value: string | ((req: Request, res: Response) => string);
  }>;
}

export interface CookieMetadata {
  name: string;
  options?: {
    domain?: string;
    maxAge?: number;
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
    httpOnly?: boolean;
    path?: string;
  };
}

/**
 * Decorator to specify required headers for a route
 *
 * If any of the specified headers are missing from the request,
 * the middleware will return a 400 Bad Request error.
 *
 * @param headers - Array of header names that are required (case-insensitive)
 *
 * @example
 * ```typescript
 * @RequiredHeaders(['authorization', 'content-type'])
 * myRoute = asyncHandler(async (req: Request, res: Response) => {
 *   // Headers are guaranteed to exist here
 * });
 * ```
 */
export function RequiredHeaders(headers: string[]) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor,
  ): void {
    const key = `${REQUIRED_HEADERS_METADATA_KEY.toString()}_${propertyKey}`;

    const metadata: RequiredHeadersMetadata = {
      headers: headers.map((h) => h.toLowerCase()),
    };

    Reflect.defineMetadata(key, metadata, target);
  };
}

/**
 * Decorator to automatically set response headers
 *
 * Headers will be set before the route handler executes.
 *
 * @param headers - Object mapping header names to their values (static or dynamic)
 *
 * @example
 * ```typescript
 * @SetHeaders({
 *   'X-API-Version': '1.0',
 *   'X-Custom-Header': (req, res) => `User-${req.user?.id}`
 * })
 * myRoute = asyncHandler(async (req: Request, res: Response) => {
 *   // Headers are already set
 * });
 * ```
 */
export function SetHeaders(headers: Record<string, string | ((req: Request, res: Response) => string)>) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor,
  ): void {
    const key = `${SET_HEADERS_METADATA_KEY.toString()}_${propertyKey}`;

    const metadata: SetHeadersMetadata = {
      headers: Object.entries(headers).map(([name, value]) => ({
        name,
        value,
      })),
    };

    Reflect.defineMetadata(key, metadata, target);
  };
}

/**
 * Decorator to specify that a route requires a specific cookie in the request
 *
 * If the cookie is missing, the middleware will return a 401 Unauthorized error.
 * The cookie value will be available in req.cookies[cookieName]
 *
 * @param cookieName - Name of the required cookie
 *
 * @example
 * ```typescript
 * @RequiredCookie('refreshToken')
 * refresh = asyncHandler(async (req: Request, res: Response) => {
 *   const refreshToken = req.cookies.refreshToken;
 *   // refreshToken is guaranteed to exist
 * });
 * ```
 */
export function RequiredCookie(cookieName: string) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor,
  ): void {
    const key = `${COOKIE_METADATA_KEY.toString()}_${propertyKey}`;

    const metadata: CookieMetadata = {
      name: cookieName,
    };

    Reflect.defineMetadata(key, metadata, target);
  };
}

/**
 * Decorator to specify that a route requires a refresh token cookie
 */
export function RefreshTokenCookie() {
  return RequiredCookie('refreshToken');
}

/**
 * Decorator to automatically set a cookie in the response
 *
 * The cookie will be set from the response data or request body/params.
 * This decorator should be combined with response interceptor logic.
 *
 * @param cookieName - Name of the cookie to set
 * @param options - Cookie options (domain, maxAge, sameSite, secure, etc.)
 *
 * @example
 * ```typescript
 * @SetCookie('refreshToken', {
 *   httpOnly: true,
 *   secure: true,
 *   sameSite: 'strict',
 *   maxAge: 7 * 24 * 60 * 60 * 1000
 * })
 * login = asyncHandler(async (req: Request, res: Response) => {
 *   // Cookie will be set automatically
 * });
 * ```
 */
export function SetCookie(
  cookieName: string,
  options?: CookieMetadata['options']
) {
  return function (
    target: object,
    propertyKey: string,
    _descriptor?: PropertyDescriptor,
  ): void {
    const key = `${SET_HEADERS_METADATA_KEY.toString()}_cookie_${propertyKey}`;

    const metadata: CookieMetadata = {
      name: cookieName,
      options,
    };

    Reflect.defineMetadata(key, metadata, target);
  };
}

/**
 * Get required headers metadata for a method
 */
export function getRequiredHeadersMetadata(
  target: object,
  methodName: string,
): RequiredHeadersMetadata | undefined {
  const key = `${REQUIRED_HEADERS_METADATA_KEY.toString()}_${methodName}`;
  return Reflect.getMetadata(key, target);
}

/**
 * Get set headers metadata for a method
 */
export function getSetHeadersMetadata(
  target: object,
  methodName: string,
): SetHeadersMetadata | undefined {
  const key = `${SET_HEADERS_METADATA_KEY.toString()}_${methodName}`;
  return Reflect.getMetadata(key, target);
}

/**
 * Get required cookie metadata for a method
 */
export function getRequiredCookieMetadata(
  target: object,
  methodName: string,
): CookieMetadata | undefined {
  const key = `${COOKIE_METADATA_KEY.toString()}_${methodName}`;
  return Reflect.getMetadata(key, target);
}

/**
 * Get set cookie metadata for a method
 */
export function getSetCookieMetadata(
  target: object,
  methodName: string,
): CookieMetadata | undefined {
  const key = `${SET_HEADERS_METADATA_KEY.toString()}_cookie_${methodName}`;
  return Reflect.getMetadata(key, target);
}

/**
 * Middleware factory to check required headers
 */
export function createRequiredHeadersMiddleware(headers: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingHeaders: string[] = [];

    for (const header of headers) {
      if (!req.headers[header.toLowerCase()]) {
        missingHeaders.push(header);
      }
    }

    if (missingHeaders.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required headers: ${missingHeaders.join(", ")}`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware factory to set response headers
 */
export function createSetHeadersMiddleware(
  headers: SetHeadersMetadata['headers']
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const header of headers) {
      const value = typeof header.value === 'function'
        ? header.value(req, res)
        : header.value;
      res.setHeader(header.name, value);
    }

    next();
  };
}

/**
 * Middleware factory to check required cookies
 */
export function createRequiredCookieMiddleware(cookieName: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies || !req.cookies[cookieName]) {
      res.status(401).json({
        success: false,
        error: `Missing required cookie: ${cookieName}`,
      });
      return;
    }

    next();
  };
}
