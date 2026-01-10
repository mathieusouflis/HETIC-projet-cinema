import "reflect-metadata";
import type { Socket } from "socket.io";

import { z } from "zod";
import { logger } from "@packages/logger";
import { WebSocketController } from "../../../../shared/infrastructure/base/controllers/WebSocketController.js";
import { RequireSocketAuth } from "../../../../shared/infrastructure/decorators/web-socket/socket-auth.decorator.js";
import { Namespace } from "../../../../shared/infrastructure/decorators/web-socket/namespace.decorator.js";
import { Subscribe } from "../../../../shared/infrastructure/decorators/web-socket/subscribe.decorator.js";
import { ValidateEvent } from "../../../../shared/infrastructure/decorators/web-socket/validate-event.decorator.js";
import { ValidateAck } from "../../../../shared/infrastructure/decorators/web-socket/validate-ack.decorator.js";
import { JoinRoom } from "../../../../shared/infrastructure/decorators/web-socket/join-room.decorator.js";
import { Publish } from "../../../../shared/infrastructure/decorators/web-socket/publish.decorator.js";
import { ValidateEmit } from "../../../../shared/infrastructure/decorators/web-socket/validate-emit.decorator.js";


const joinRoomSchema = z.object({
  roomId: z.string().min(1).max(100),
  userId: z.string().uuid(),
  username: z.string().min(1).max(50),
});

const leaveRoomSchema = z.object({
  roomId: z.string().min(1).max(100),
});

const sendMessageSchema = z.object({
  roomId: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  userId: z.string().uuid(),
  username: z.string().min(1).max(50),
});

const typingSchema = z.object({
  roomId: z.string().min(1).max(100),
  userId: z.string().uuid(),
  username: z.string(),
  isTyping: z.boolean(),
});

const messageAckSchema = z.object({
  success: z.boolean(),
  messageId: z.string().uuid().optional(),
  error: z.string().optional(),
  timestamp: z.date(),
});

const newMessageSchema = z.object({
  messageId: z.string().uuid(),
  roomId: z.string(),
  userId: z.string(),
  username: z.string(),
  message: z.string(),
  timestamp: z.date(),
});

const userJoinedSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  username: z.string(),
  timestamp: z.date(),
});

const userLeftSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  username: z.string(),
  timestamp: z.date(),
});

const userTypingSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  username: z.string(),
  isTyping: z.boolean(),
});

const joinAckSchema = z.object({
  success: z.boolean(),
  users: z.array(z.string()),
  error: z.string().optional(),
});


@RequireSocketAuth
@Namespace({
  path: "/chat",
  description: "Real-time chat communication",
})
export class ChatEventController extends WebSocketController {
  // Track user-room relationships
  private userRooms = new Map<string, Set<string>>(); // userId -> Set<roomId>
  private roomUsers = new Map<string, Set<string>>(); // roomId -> Set<userId>
  private socketUsers = new Map<string, string>(); // socketId -> userId

  // ============================================
  // Subscribe Events (Client -> Server)
  // ============================================

  @Subscribe({
    event: "chat:join",
    description: "Join a chat room",
    acknowledgment: true,
  })
  @ValidateEvent(joinRoomSchema)
  @ValidateAck(joinAckSchema)
  @JoinRoom((data) => `room:${data.roomId}`)
  async handleJoinRoom(socket: Socket, data: z.infer<typeof joinRoomSchema>) {
    const { roomId, userId, username } = data;

    try {
      // Track user-room relationship
      if (!this.userRooms.has(userId)) {
        this.userRooms.set(userId, new Set());
      }
      this.userRooms.get(userId)!.add(roomId);

      if (!this.roomUsers.has(roomId)) {
        this.roomUsers.set(roomId, new Set());
      }
      this.roomUsers.get(roomId)!.add(userId);

      // Track socket-user relationship
      this.socketUsers.set(socket.id, userId);

      // Notify others in the room
      await this.notifyUserJoined(roomId, userId, username);

      const users = Array.from(this.roomUsers.get(roomId) || []);


      return { success: true, users };
    } catch (error: any) {
      return { success: false, users: [], error: error.message };
    }
  }

  @Subscribe({
    event: "chat:leave",
    description: "Leave a chat room",
  })
  @ValidateEvent(leaveRoomSchema)
  async handleLeaveRoom(_socket: Socket, _: z.infer<typeof leaveRoomSchema>) {

    // // Get userId from socket
    // const userId = this.socketUsers.get(socket.id);
    // if (!userId) {
    //   return;
    // }

    // // Clean up tracking
    // this.userRooms.get(userId)?.delete(roomId);
    // this.roomUsers.get(roomId)?.delete(userId);

    // // Notify others
    // await this.notifyUserLeft(roomId, userId, "User");

  }

  @Subscribe({
    event: "chat:message",
    description: "Send a message to a chat room",
    acknowledgment: true,
  })
  @ValidateEvent(sendMessageSchema)
  @ValidateAck(messageAckSchema)
  async handleMessage(_socket: Socket, data: z.infer<typeof sendMessageSchema>) {
    const { roomId, message, userId, username } = data;

    try {
      // Generate message ID (in production, you would save to DB here)
      const messageId = crypto.randomUUID();
      const timestamp = new Date();

      // Broadcast message to room
      await this.broadcastNewMessage({
        messageId,
        roomId,
        userId,
        username,
        message,
        timestamp,
      });


      return {
        success: true,
        messageId,
        timestamp,
      };
    } catch (error: any) {
      logger.info(`Error sending message:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  @Subscribe({
    event: "chat:typing",
    description: "Notify others that user is typing",
  })
  @ValidateEvent(typingSchema)
  async handleTyping(socket: Socket, data: z.infer<typeof typingSchema>) {
    const { roomId } = data;

    // Broadcast typing status to others in the room (except sender)
    socket.to(`room:${roomId}`).emit("chat:user-typing", data);
  }

  // ============================================
  // Publish Events (Server -> Client)
  // ============================================

  @Publish({
    event: "chat:new-message",
    description: "New message received in chat room",
    room: "dynamic",
    broadcast: true,
  })
  @ValidateEmit(newMessageSchema)
  private async broadcastNewMessage(
    data: z.infer<typeof newMessageSchema>,
  ): Promise<void> {
    this.emitToRoom(`room:${data.roomId}`, "chat:new-message", data);
  }

  @Publish({
    event: "chat:user-joined",
    description: "User joined the chat room",
    broadcast: true,
  })
  @ValidateEmit(userJoinedSchema)
  private async notifyUserJoined(
    roomId: string,
    userId: string,
    username: string,
  ): Promise<void> {
    this.emitToRoom(`room:${roomId}`, "chat:user-joined", {
      roomId,
      userId,
      username,
      timestamp: new Date(),
    });
  }

  @Publish({
    event: "chat:user-left",
    description: "User left the chat room",
    broadcast: true,
  })
  @ValidateEmit(userLeftSchema)
  private async notifyUserLeft(
    roomId: string,
    userId: string,
    username: string,
  ): Promise<void> {
    this.emitToRoom(`room:${roomId}`, "chat:user-left", {
      roomId,
      userId,
      username,
      timestamp: new Date(),
    });
  }

  @Publish({
    event: "chat:user-typing",
    description: "User is typing indicator",
    broadcast: true,
  })
  @ValidateEmit(userTypingSchema)
  public notifyTyping(data: z.infer<typeof userTypingSchema>): void {
    // Emit typing status to room
    this.emitToRoom(`room:${data.roomId}`, "chat:user-typing", data);
  }

  // ============================================
  // Lifecycle Hooks
  // ============================================

  protected override handleDisconnection(socket: Socket, reason: string): void {
    super.handleDisconnection(socket, reason);

    // Get userId from socket
    const userId = this.socketUsers.get(socket.id);
    if (!userId) {
      return;
    }

    // Get all rooms user was in
    const rooms = this.userRooms.get(userId);
    if (rooms) {
      // Notify all rooms that user left
      rooms.forEach((roomId) => {
        this.notifyUserLeft(roomId, userId, "User");
        this.roomUsers.get(roomId)?.delete(userId);
      });
    }

    // Clean up tracking
    this.userRooms.delete(userId);
    this.socketUsers.delete(socket.id);

    logger.info(`🔌 User ${userId} disconnected and cleaned up from all rooms`);
  }
}
