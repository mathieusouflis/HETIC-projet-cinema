import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ValidationError } from "../errors/index.js";

type ValidationTarget = "body" | "query" | "params";

/**
 * Validation middleware factory using Zod schemas
 *
 * Creates an Express middleware that validates request data against a Zod schema
 * and replaces the raw data with the validated/transformed result
 *
 * @param schema - Zod schema to validate against
 * @param target - Where to find the data to validate ('body' | 'query' | 'params')
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 *
 * const createUserSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * router.post('/users',
 *   validateRequest(createUserSchema, 'body'),
 *   userController.create
 * );
 * ```
 */
export const validateRequest = (
  schema: ZodSchema,
  target: ValidationTarget = "body",
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req[target]);

      req[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return next(new ValidationError("Validation failed", formattedErrors));
      }

      next(error);
    }
  };
};

/**
 * Validate multiple targets at once
 *
 * @param schemas - Object mapping targets to their Zod schemas
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * router.put('/users/:id',
 *   validateMultiple({
 *     params: z.object({ id: z.string().uuid() }),
 *     body: z.object({ name: z.string() }),
 *   }),
 *   userController.update
 * );
 * ```
 */
export const validateMultiple = (
  schemas: Partial<Record<ValidationTarget, ZodSchema>>,
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string; code: string }[] = [];

    for (const [target, schema] of Object.entries(schemas) as [
      ValidationTarget,
      ZodSchema,
    ][]) {
      try {
        req[target] = schema.parse(req[target]);
      } catch (error) {
        if (error instanceof ZodError) {
          error.errors.forEach((err) => {
            errors.push({
              field: `${target}.${err.path.join(".")}`,
              message: err.message,
              code: err.code,
            });
          });
        } else {
          return next(error);
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError("Validation failed", errors));
    }

    next();
  };
};
