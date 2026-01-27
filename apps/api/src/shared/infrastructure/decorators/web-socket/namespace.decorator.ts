import {
  type NamespaceMetadata,
  WebSocketMetadataStorage,
} from "./websocket.metadata";

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
  return <T extends new (...args: any[]) => any>(controllerConstructor: T) => {
    const metadata: NamespaceMetadata = {
      path: options.path,
      description: options.description,
      middlewares: options.middlewares,
    };

    WebSocketMetadataStorage.setNamespace(
      controllerConstructor.prototype,
      metadata
    );
    return controllerConstructor;
  };
}
