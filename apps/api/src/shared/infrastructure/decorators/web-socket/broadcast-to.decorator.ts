import {
  type RoomMetadata,
  WebSocketMetadataStorage,
} from "./websocket.metadata";

/**
 * Mark a method as broadcasting to a specific room
 * @example
 * @BroadcastTo((data) => `room:${data.roomId}`)
 * @Publish({ event: 'message:new', broadcast: true })
 * async broadcastMessage(data: Message) {}
 */
export function BroadcastTo(
  roomNameOrGetter: string | ((data: any) => string)
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const isRoomNameOrGetterString = typeof roomNameOrGetter === "string";
    const roomMetadata: RoomMetadata = {
      roomName: isRoomNameOrGetterString ? roomNameOrGetter : "dynamic",
      methodName: propertyKey,
      action: "broadcast",
      description: `Broadcasts to room: ${isRoomNameOrGetterString ? roomNameOrGetter : "computed from data"}`,
    };

    WebSocketMetadataStorage.addRoom(target, roomMetadata);

    return descriptor;
  };
}
