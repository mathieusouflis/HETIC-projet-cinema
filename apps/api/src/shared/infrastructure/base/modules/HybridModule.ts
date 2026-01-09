import type { Router } from "express";
import type { Server as SocketIOServer } from "socket.io";
import { BaseModule } from "./BaseModule";
import { RestModuleInterface } from "./RestModule";
import { WebSocketModuleInterface } from "./WebSocketModule";

export abstract class HybridModule
  extends BaseModule
  implements RestModuleInterface, WebSocketModuleInterface
{
  abstract getRouter(): Router;
  abstract registerEvents(io: SocketIOServer): void;

  public getOpenAPISpec?(): any {
    return null;
  }

  public getAsyncAPISpec?(): any {
    return null;
  }
}
