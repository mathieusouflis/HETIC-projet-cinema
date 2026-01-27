import {
  type RoomMetadata,
  WebSocketMetadataStorage,
} from "./websocket.metadata";

/**
 * Automatically leave a room when this event is triggered
 * @example
 * @Subscribe('chat:leave')
 * @LeaveRoom((data) => `room:${data.roomId}`)
 * async handleLeaveChat(socket: Socket, data: { roomId: string }) {}
 */
export function LeaveRoom(roomNameOrGetter: string | ((data: any) => string)) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const isRoomNameOrGetterString = typeof roomNameOrGetter === "string";
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      this: any,
      socket: any,
      data: any,
      ...args: any[]
    ) {
      const roomName = isRoomNameOrGetterString
        ? roomNameOrGetter
        : roomNameOrGetter(data);

      await socket.leave(roomName);
      return originalMethod.apply(this, [socket, data, ...args]);
    };

    const roomMetadata: RoomMetadata = {
      roomName: isRoomNameOrGetterString ? roomNameOrGetter : "dynamic",
      methodName: propertyKey,
      action: "leave",
      description: `Leaves room: ${isRoomNameOrGetterString ? roomNameOrGetter : "computed from data"}`,
    };

    WebSocketMetadataStorage.addRoom(target, roomMetadata);

    return descriptor;
  };
}
