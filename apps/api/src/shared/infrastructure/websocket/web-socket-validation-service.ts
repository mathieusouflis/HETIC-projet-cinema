import type { z } from "zod";
import { ZodError } from "zod";
import { WebSocketValidationError } from "../../errors/websocket";

/**
 * Service for handling WebSocket event validation
 * Separates validation logic from the controller
 */
export class WebSocketValidationService {
  /**
   * Validate incoming event data against Zod schema
   * @throws WebSocketValidationError if validation fails
   */
  public validateEventData<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    eventName: string
  ): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          path: err.path.map(String),
          message: err.message,
        }));
        throw new WebSocketValidationError(
          "Event data validation failed",
          details,
          eventName
        );
      }
      throw new WebSocketValidationError(
        "Event data validation failed",
        undefined,
        eventName
      );
    }
  }

  /**
   * Validate acknowledgment response against Zod schema
   * @throws WebSocketValidationError if validation fails
   */
  public validateAcknowledgment<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    eventName: string
  ): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          path: err.path.map(String),
          message: err.message,
        }));
        throw new WebSocketValidationError(
          "Acknowledgment validation failed",
          details,
          eventName
        );
      }
      throw new WebSocketValidationError(
        "Acknowledgment validation failed",
        undefined,
        eventName
      );
    }
  }

  /**
   * Safely parse JSON data
   * Returns parsed object or original data if already an object
   */
  public parseEventData(data: unknown): unknown {
    if (typeof data === "object" && data !== null) {
      return data;
    }

    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }

    return data;
  }

  /**
   * Create a singleton instance
   */
  private static instance: WebSocketValidationService;

  public static getInstance(): WebSocketValidationService {
    if (!WebSocketValidationService.instance) {
      WebSocketValidationService.instance = new WebSocketValidationService();
    }
    return WebSocketValidationService.instance;
  }
}

export const webSocketValidationService =
  WebSocketValidationService.getInstance();
