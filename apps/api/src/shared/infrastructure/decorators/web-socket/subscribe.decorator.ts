import { EventListenerMetadata, WebSocketMetadataStorage } from "./websocket.metadata";

/**
 * Listen to a WebSocket event (client -> server)
 * @example
 * @Subscribe('message:send')
 * async handleMessage(socket: Socket, data: MessageData) {}
 *
 * @Subscribe({ event: 'message:send', acknowledgment: true })
 * async handleMessage(socket: Socket, data: MessageData) { return { success: true }; }
 */
export function Subscribe(
  eventNameOrOptions:
    | string
    | {
        event: string;
        description?: string;
        acknowledgment?: boolean;
        deprecated?: boolean;
      },
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const isEventNameString = typeof eventNameOrOptions === "string";
    const eventMetadata: EventListenerMetadata = {
      eventName:
        isEventNameString
          ? eventNameOrOptions
          : eventNameOrOptions.event,
      methodName: propertyKey,
      description:
        isEventNameString
          ? undefined
          : eventNameOrOptions.description,
      acknowledgment:
        isEventNameString
          ? false
          : eventNameOrOptions.acknowledgment ?? false,
      deprecated:
        isEventNameString
          ? false
          : eventNameOrOptions.deprecated ?? false,
    };

    WebSocketMetadataStorage.addEvent(target, eventMetadata);
    return descriptor;
  };
}

/**
 * Alias for Subscribe decorator
 */
export const OnEvent = Subscribe;
