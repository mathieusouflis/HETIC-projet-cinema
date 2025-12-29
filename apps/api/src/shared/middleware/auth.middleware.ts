import type { Request, Response, NextFunction } from "express";
import { JWTService } from "../services/token/JWTService.js";
import { UnauthorizedError } from "../errors/index.js";
import type { AccessTokenPayload } from "../services/token/ITokenService.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

const jwtService = new JWTService();

/**
 * Extract Bearer token from Authorization header
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null if invalid format
 */
const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  const token = parts[1];
  return token !== undefined ? token : null;
};

/**
 * Authentication middleware
 *
 * Verifies JWT token from Authorization header and attaches user info to request
 *
 * @example
 * ```ts
 * router.get('/profile', authMiddleware, profileController.get);
 * ```
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError("No authentication token provided");
    }

    const payload: AccessTokenPayload = jwtService.verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Access token expired") {
        return next(new UnauthorizedError("Token expired"));
      }
      if (error.message === "Invalid access token") {
        return next(new UnauthorizedError("Invalid token"));
      }
    }

    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    next(new UnauthorizedError("Authentication failed"));
  }
};

/**
 * Optional authentication middleware
 *
 * Similar to authMiddleware but doesn't fail if no token is present
 *
 * @example
 * ```ts
 * router.get('/films', optionalAuthMiddleware, filmsController.list);
 * // Controller can check req.user to customize response for logged-in users
 * ```
 */
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return next();
  }

  try {
    const payload = jwtService.verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    /* NO CONTENT */
  }

  next();
};

/**
 * Middleware factory for role-based authorization
 *
 * Creates middleware that checks if the authenticated user has one of the allowed roles
 * Must be used after authMiddleware
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * router.delete('/users/:id',
 *   authMiddleware,
 *   requireRole('admin', 'superadmin'),
 *   userController.delete
 * );
 * ```
 */
export const requireRole = (..._allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // TODO: Implement role checking when roles are added to user model
    // const userRole = (req.user as any).role;
    // if (!allowedRoles.includes(userRole)) {
    //   return next(new ForbiddenError('Insufficient permissions'));
    // }

    next();
  };
};

/**
 * Middleware factory for resource ownership verification
 *
 * Creates middleware that checks if the authenticated user owns the resource
 * Compares req.user.userId with the specified request parameter
 *
 * @param paramName - Name of the request parameter containing the resource owner ID
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * router.patch('/users/:id',
 *   authMiddleware,
 *   requireOwnership('id'),
 *   userController.update
 * );
 * ```
 */
export const requireOwnership = (paramName: string = "id") => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const resourceOwnerId = req.params[paramName];

    if (req.user.userId !== resourceOwnerId) {
      return next(
        new UnauthorizedError("You can only access your own resources"),
      );
    }

    next();
  };
};
