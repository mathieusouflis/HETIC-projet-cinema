import "reflect-metadata";
import type { Server as SocketIOServer } from "socket.io";
import { ChatEventController } from "./application/controllers/chat-event.controller.js";
import { WebSocketModule } from "../../shared/infrastructure/base/modules/WebSocketModule.js";

/**
 * Chat Module - WebSocket-only module for real-time chat
 */
class ChatModule extends WebSocketModule {
  private readonly eventController: ChatEventController;

  constructor() {
    super({
      name: "ChatModule",
      version: "1.0.0",
      description: "Real-time chat module with WebSocket support",
    });

    this.eventController = new ChatEventController();
  }

  /**
   * Register WebSocket events with Socket.IO server
   */
  public registerEvents(io: SocketIOServer): void {
    this.eventController.registerEvents(io);
  }

  /**
   * Get AsyncAPI specification for this module
   */
  public getAsyncAPISpec(): any {
    return this.eventController.getMetadata();
  }

  /**
   * Get the event controller instance
   */
  public getEventController(): ChatEventController {
    return this.eventController;
  }
}

export const chatModule = new ChatModule();
