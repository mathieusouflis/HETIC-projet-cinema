import { WebSocketMetadataStorage } from "./websocket.metadata";

/**
 * Apply middleware to a WebSocket event handler
 * @example
 * @Subscribe('chat:send')
 * @UseEventMiddleware(authSocketMiddleware, rateLimitMiddleware)
 * async handleMessage(socket: Socket, data: Message) {}
 */
export function UseEventMiddleware(...middlewares: any[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    WebSocketMetadataStorage.setMiddlewares(target, propertyKey, middlewares);
    return descriptor;
  };
}
