import type z from "zod";
import {
  WebSocketMetadataStorage,
  type WebSocketValidationMetadata,
} from "./websocket.metadata";

/**
 * Validate acknowledgment response with Zod schema
 * @example
 * @Subscribe({ event: 'message:send', acknowledgment: true })
 * @ValidateAck(messageAckSchema)
 * async handleMessage(socket: Socket, data: Message) {
 *   return { success: true, messageId: '123' };
 * }
 */
export function ValidateAck(schema: z.ZodSchema) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const existingMetadata =
      WebSocketMetadataStorage.getValidation(target, propertyKey) || {};

    const newMetadata: WebSocketValidationMetadata = {
      ...existingMetadata,
      ack: schema,
    };

    WebSocketMetadataStorage.setValidation(target, propertyKey, newMetadata);
    return descriptor;
  };
}
