import {
  type EventEmitterMetadata,
  WebSocketMetadataStorage,
} from "./websocket.metadata";

/**
 * Document an event that this controller emits (server -> client)
 * @example
 * @Publish({ event: 'message:new', description: 'New message received' })
 * async notifyNewMessage(data: Message) {}
 */
export function Publish(options: {
  event: string;
  description?: string;
  room?: string;
  broadcast?: boolean;
}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const emitMetadata: EventEmitterMetadata = {
      eventName: options.event,
      description: options.description,
      room: options.room,
      broadcast: options.broadcast ?? false,
      methodName: propertyKey,
    };

    WebSocketMetadataStorage.addEmit(target, emitMetadata);
    return descriptor;
  };
}

/**
 * Alias for Publish decorator
 */
export const EmitEvent = Publish;
