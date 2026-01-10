
class ChatLeaveDto {
  private _roomId: string;
  private _additionalProperties?: Map<string, any>;

  constructor(input: {
    roomId: string,
    additionalProperties?: Map<string, any>,
  }) {
    this._roomId = input.roomId;
    this._additionalProperties = input.additionalProperties;
  }

  get roomId(): string { return this._roomId; }
  set roomId(roomId: string) { this._roomId = roomId; }

  get additionalProperties(): Map<string, any> | undefined { return this._additionalProperties; }
  set additionalProperties(additionalProperties: Map<string, any> | undefined) { this._additionalProperties = additionalProperties; }
}
export { ChatLeaveDto };