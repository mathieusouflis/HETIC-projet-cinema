import { socketAuthNamespaceMiddleware } from "../../../middleware";
import { NamespaceMetadata, WebSocketMetadataStorage } from "./websocket.metadata";

/**
 * Require socket authentication at namespace connection level
 *
 * The token can be provided in two ways:
 * 1. Via auth object: `socket.auth.token` (recommended for socket.io-client)
 * 2. Via authorization header: `socket.handshake.headers.authorization` (Bearer token)
 *
 * @example Namespace authentication
 * ```ts
 * @Namespace({ path: '/chat', description: 'Chat namespace' })
 * @RequireSocketAuth
 * class ChatController extends WebSocketController {
 *   @Subscribe('message:send')
 *   async handleMessage(socket: Socket, data: Message) {
 *     // socket.user is GUARANTEED to be available here
 *     console.log(socket.user.userId, socket.user.email);
 *   }
 * }
 * ```
 *
 * @example Client-side (socket.io-client)
 * ```ts
 * const socket = io('http://localhost:3000/chat', {
 *   auth: { token: 'your-jwt-token' }
 * });
 * ```
 *
 * @example Client-side (with authorization header)
 * ```ts
 * const socket = io('http://localhost:3000/chat', {
 *   extraHeaders: {
 *     authorization: 'Bearer your-jwt-token'
 *   }
 * });
 * ```
 */
export function RequireSocketAuth<T extends new (...args: any[]) => any>(
  constructor: T,
) {
  const existingMetadata = WebSocketMetadataStorage.getNamespace(
    constructor.prototype,
  );

  if (!existingMetadata) {
    throw new Error(
      `@RequireSocketAuth must be used before @Namespace decorator on ${constructor.name}`,
    );
  }

  const middlewares = existingMetadata.middlewares || [];
  const updatedMetadata: NamespaceMetadata = {
    ...existingMetadata,
    middlewares: [socketAuthNamespaceMiddleware, ...middlewares],
    requireAuth: true,
  };

  WebSocketMetadataStorage.setNamespace(constructor.prototype, updatedMetadata);

  return constructor;
}
