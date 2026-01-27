import {
  type RoomMetadata,
  WebSocketMetadataStorage,
} from "./websocket.metadata";

/**
 * Automatically join a room when this event is triggered
 * @example
 * @Subscribe('chat:join')
 * @JoinRoom((data) => `room:${data.roomId}`)
 * async handleJoinChat(socket: Socket, data: { roomId: string }) {}
 */
export function JoinRoom(roomNameOrGetter: string | ((data: any) => string)) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const isRoomNameOrGetterString = typeof roomNameOrGetter === "string";
    descriptor.value = async function (
      this: any,
      socket: any,
      data: any,
      ...args: any[]
    ) {
      const roomName = isRoomNameOrGetterString
        ? roomNameOrGetter
        : roomNameOrGetter(data);

      await socket.join(roomName);
      return originalMethod.apply(this, [socket, data, ...args]);
    };

    const roomMetadata: RoomMetadata = {
      roomName: isRoomNameOrGetterString ? roomNameOrGetter : "dynamic",
      methodName: propertyKey,
      action: "join",
      description: `Joins room: ${isRoomNameOrGetterString ? roomNameOrGetter : "computed from data"}`,
    };

    WebSocketMetadataStorage.addRoom(target, roomMetadata);

    return descriptor;
  };
}
