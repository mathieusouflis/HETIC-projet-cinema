import z from "zod";
import { EventEmitterMetadata, WebSocketMetadataStorage } from "./websocket.metadata";

/**
 * Validate emitted event data with Zod schema
 * @example
 * @Publish({ event: 'message:new' })
 * @ValidateEmit(newMessageSchema)
 * async notifyNewMessage(data: z.infer<typeof newMessageSchema>) {}
 */
export function ValidateEmit(schema: z.ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const emits = WebSocketMetadataStorage.getEmits(target);
    const emit = emits.find(
      (e: EventEmitterMetadata) => e.methodName === propertyKey,
    );

    if (emit) {
      emit.validation = schema;
    }

    return descriptor;
  };
}
