import type { Server as SocketIOServer } from "socket.io";
import { BaseModule } from "./BaseModule";

export interface WebSocketModuleInterface {
  registerEvents(io: SocketIOServer): void;
  getAsyncAPISpec?(): any;
}

export abstract class WebSocketModule
  extends BaseModule
  implements WebSocketModuleInterface
{
  abstract registerEvents(io: SocketIOServer): void;

  public getAsyncAPISpec?(): any {
    return null;
  }
}
