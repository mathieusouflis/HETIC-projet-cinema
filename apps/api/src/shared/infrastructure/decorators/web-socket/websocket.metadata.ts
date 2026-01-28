import "reflect-metadata";
import type { z } from "zod";

export const WS_METADATA_KEYS = {
  NAMESPACE: Symbol("ws:namespace"),
  EVENTS: Symbol("ws:events"),
  EMITS: Symbol("ws:emits"),
  ROOMS: Symbol("ws:rooms"),
  VALIDATION: Symbol("ws:validation"),
  MIDDLEWARES: Symbol("ws:middlewares"),
  ACKNOWLEDGMENT: Symbol("ws:acknowledgment"),
} as const;

export interface NamespaceMetadata {
  path: string;
  description?: string;
  middlewares?: any[];
  requireAuth?: boolean;
}

export interface EventListenerMetadata {
  eventName: string;
  methodName: string;
  description?: string;
  acknowledgment?: boolean;
  deprecated?: boolean;
  rooms?: string[];
  validation?: {
    data?: z.ZodSchema;
    ack?: z.ZodSchema;
  };
}

export interface EventEmitterMetadata {
  eventName: string;
  description?: string;
  room?: string;
  broadcast?: boolean;
  validation?: z.ZodSchema;
  methodName?: string;
}

export interface RoomMetadata {
  roomName: string;
  description?: string;
  methodName: string;
  action: "join" | "leave" | "broadcast";
}

export interface WebSocketValidationMetadata {
  data?: z.ZodSchema;
  ack?: z.ZodSchema;
}

export class WebSocketMetadataStorage {
  static getNamespace(target: any): NamespaceMetadata | undefined {
    return Reflect.getMetadata(WS_METADATA_KEYS.NAMESPACE, target);
  }

  static setNamespace(target: any, metadata: NamespaceMetadata): void {
    Reflect.defineMetadata(WS_METADATA_KEYS.NAMESPACE, metadata, target);
  }

  static getEvents(target: any): EventListenerMetadata[] {
    return Reflect.getMetadata(WS_METADATA_KEYS.EVENTS, target) || [];
  }

  static addEvent(target: any, event: EventListenerMetadata): void {
    const events = WebSocketMetadataStorage.getEvents(target);
    events.push(event);
    Reflect.defineMetadata(WS_METADATA_KEYS.EVENTS, events, target);
  }

  static getEmits(target: any): EventEmitterMetadata[] {
    return Reflect.getMetadata(WS_METADATA_KEYS.EMITS, target) || [];
  }

  static addEmit(target: any, emit: EventEmitterMetadata): void {
    const emits = WebSocketMetadataStorage.getEmits(target);
    emits.push(emit);
    Reflect.defineMetadata(WS_METADATA_KEYS.EMITS, emits, target);
  }

  static getRooms(target: any): RoomMetadata[] {
    return Reflect.getMetadata(WS_METADATA_KEYS.ROOMS, target) || [];
  }

  static addRoom(target: any, room: RoomMetadata): void {
    const rooms = WebSocketMetadataStorage.getRooms(target);
    rooms.push(room);
    Reflect.defineMetadata(WS_METADATA_KEYS.ROOMS, rooms, target);
  }

  static getValidation(
    target: any,
    methodName: string
  ): WebSocketValidationMetadata | undefined {
    const key = `${WS_METADATA_KEYS.VALIDATION.toString()}_${methodName}`;
    return Reflect.getMetadata(key, target);
  }

  static setValidation(
    target: any,
    methodName: string,
    validation: WebSocketValidationMetadata
  ): void {
    const key = `${WS_METADATA_KEYS.VALIDATION.toString()}_${methodName}`;
    Reflect.defineMetadata(key, validation, target);
  }

  static getMiddlewares(target: any, methodName: string): any[] | undefined {
    const key = `${WS_METADATA_KEYS.MIDDLEWARES.toString()}_${methodName}`;
    return Reflect.getMetadata(key, target);
  }

  static setMiddlewares(
    target: any,
    methodName: string,
    middlewares: any[]
  ): void {
    const key = `${WS_METADATA_KEYS.MIDDLEWARES.toString()}_${methodName}`;
    Reflect.defineMetadata(key, middlewares, target);
  }
}
