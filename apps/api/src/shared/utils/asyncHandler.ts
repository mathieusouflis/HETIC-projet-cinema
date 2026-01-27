import type { NextFunction, Request, Response } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for controller routes response validation
) => Promise<any>;

/**
 * Wrapper function for async Express route handlers
 *
 * Catches any errors thrown in async handlers and passes them to Express error middleware
 *
 * @param fn - Async function to wrap
 * @returns Express middleware function that handles Promise rejection
 *
 * @example
 * ```ts
 * // Without asyncHandler (verbose)
 * async getUser(req: Request, res: Response, next: NextFunction) {
 *   try {
 *     const user = await userService.findById(req.params.id);
 *     res.json(user);
 *   } catch (error) {
 *     next(error);
 *   }
 * }
 *
 * // With asyncHandler (clean)
 * getUser = asyncHandler(async (req: Request, res: Response) => {
 *   const user = await userService.findById(req.params.id);
 *   res.json(user);
 * });
 * ```
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
