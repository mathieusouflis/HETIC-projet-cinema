import z from "zod";
import { WebSocketMetadataStorage, WebSocketValidationMetadata } from "./websocket.metadata";

/**
 * Combined validation decorator for event data and acknowledgment
 * @example
 * @Subscribe({ event: 'message:send', acknowledgment: true })
 * @Validate({
 *   data: messageSchema,
 *   ack: messageAckSchema
 * })
 * async handleMessage(socket: Socket, data: Message) {}
 */
export function Validate(validationOptions: {
  data?: z.ZodSchema;
  ack?: z.ZodSchema;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const metadata: WebSocketValidationMetadata = {
      data: validationOptions.data,
      ack: validationOptions.ack,
    };

    WebSocketMetadataStorage.setValidation(target, propertyKey, metadata);
    return descriptor;
  };
}
