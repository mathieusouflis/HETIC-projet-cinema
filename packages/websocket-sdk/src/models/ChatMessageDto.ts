
class ChatMessageDto {
  private _roomId: string;
  private _message: string;
  private _userId: string;
  private _username: string;
  private _additionalProperties?: Map<string, any>;

  constructor(input: {
    roomId: string,
    message: string,
    userId: string,
    username: string,
    additionalProperties?: Map<string, any>,
  }) {
    this._roomId = input.roomId;
    this._message = input.message;
    this._userId = input.userId;
    this._username = input.username;
    this._additionalProperties = input.additionalProperties;
  }

  get roomId(): string { return this._roomId; }
  set roomId(roomId: string) { this._roomId = roomId; }

  get message(): string { return this._message; }
  set message(message: string) { this._message = message; }

  get userId(): string { return this._userId; }
  set userId(userId: string) { this._userId = userId; }

  get username(): string { return this._username; }
  set username(username: string) { this._username = username; }

  get additionalProperties(): Map<string, any> | undefined { return this._additionalProperties; }
  set additionalProperties(additionalProperties: Map<string, any> | undefined) { this._additionalProperties = additionalProperties; }
}
export { ChatMessageDto };