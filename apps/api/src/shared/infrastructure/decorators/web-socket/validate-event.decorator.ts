import type z from "zod";
import {
  WebSocketMetadataStorage,
  type WebSocketValidationMetadata,
} from "./websocket.metadata";

/**
 * Validate incoming event data with Zod schema
 * @example
 * @Subscribe('message:send')
 * @ValidateEvent(messageSchema)
 * async handleMessage(socket: Socket, data: z.infer<typeof messageSchema>) {}
 */
export function ValidateEvent(schema: z.ZodSchema) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const existingMetadata =
      WebSocketMetadataStorage.getValidation(target, propertyKey) || {};

    const newMetadata: WebSocketValidationMetadata = {
      ...existingMetadata,
      data: schema,
    };

    WebSocketMetadataStorage.setValidation(target, propertyKey, newMetadata);
    return descriptor;
  };
}
