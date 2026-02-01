import type { Response } from "express";

/**
 * Standardized controller response utilities
 * Provides consistent API responses across all controllers
 */
export class ControllerResponse {
  /**
   * Send a successful response
   * @param res Express response object
   * @param data Response data
   * @param statusCode HTTP status code (default: 200)
   * @param message Optional success message
   */
  static success<T>(
    res: Response,
    data: T,
    statusCode = 200,
    message?: string
  ): T {
    res.status(statusCode).json({
      success: true,
      ...(message && { message }),
      data,
    });
    return data;
  }

  /**
   * Send a created response (201)
   * @param res Express response object
   * @param data Created resource data
   * @param message Optional success message
   */
  static created<T>(
    res: Response,
    data: T,
    message = "Resource created successfully"
  ): T {
    return ControllerResponse.success(res, data, 201, message);
  }

  /**
   * Send a no content response (204)
   * @param res Express response object
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send an updated response (200)
   * @param res Express response object
   * @param data Updated resource data
   * @param message Optional success message
   */
  static updated<T>(
    res: Response,
    data: T,
    message = "Resource updated successfully"
  ): T {
    return ControllerResponse.success(res, data, 200, message);
  }

  /**
   * Send a deleted response (200)
   * @param res Express response object
   * @param data Optional data (if any)
   * @param message Optional success message
   */
  static deleted<T = void>(
    res: Response,
    data?: T,
    message = "Resource deleted successfully"
  ): T | void {
    if (data) {
      return ControllerResponse.success(res, data, 200, message);
    }
    res.status(200).json({
      success: true,
      message,
    });
  }
}
