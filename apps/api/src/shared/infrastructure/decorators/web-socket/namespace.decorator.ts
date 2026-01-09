import { NamespaceMetadata, WebSocketMetadataStorage } from "./websocket.metadata";

/**
 * Define WebSocket namespace for a controller
 * @example
 * @Namespace({ path: '/chat', description: 'Chat namespace' })
 * class ChatController extends WebSocketController {}
 */
export function Namespace(options: {
  path: string;
  description?: string;
  middlewares?: any[];
}) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    const metadata: NamespaceMetadata = {
      path: options.path,
      description: options.description,
      middlewares: options.middlewares,
    };

    WebSocketMetadataStorage.setNamespace(constructor.prototype, metadata);
    return constructor;
  };
}
