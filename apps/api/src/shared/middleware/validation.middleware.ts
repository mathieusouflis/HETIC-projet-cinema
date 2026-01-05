import type { Request, Response, NextFunction } from "express";
import z, { ZodError } from "zod";
import { ValidationError } from "../errors/index.js";

type ValidationTarget = "body" | "query" | "params";

type ZodIssue = ZodError["issues"][number];
type ZodSchema = z.ZodType;

export const validateRequest = (
  schema: ZodSchema,
  target: ValidationTarget = "body",
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req[target]);

      if (target === "body") {
        req[target] = validated;
      } else {
        Object.defineProperty(req, target, {
          value: validated,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err: ZodIssue) => ({
          field: err.path.length > 0 ? err.path.join(".") : "unknown",
          message: err.message,
          code: err.code,
        }));

        return next(new ValidationError("Validation failed", formattedErrors));
      }

      next(error);
    }
  };
};

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
        const validated = schema.parse(req[target]);

        if (target === "body") {
          req[target] = validated;
        } else {
          Object.defineProperty(req, target, {
            value: validated,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      } catch (error) {
        if (error instanceof ZodError) {
          error.issues.forEach((err: ZodIssue) => {
            const fieldPath = err.path.length > 0 ? err.path.join(".") : "unknown";
            errors.push({
              field: `${target}.${fieldPath}`,
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
