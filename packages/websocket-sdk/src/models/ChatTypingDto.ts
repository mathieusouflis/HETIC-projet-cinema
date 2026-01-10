
class ChatTypingDto {
  private _roomId: string;
  private _userId: string;
  private _username: string;
  private _isTyping: boolean;
  private _additionalProperties?: Map<string, any>;

  constructor(input: {
    roomId: string,
    userId: string,
    username: string,
    isTyping: boolean,
    additionalProperties?: Map<string, any>,
  }) {
    this._roomId = input.roomId;
    this._userId = input.userId;
    this._username = input.username;
    this._isTyping = input.isTyping;
    this._additionalProperties = input.additionalProperties;
  }

  get roomId(): string { return this._roomId; }
  set roomId(roomId: string) { this._roomId = roomId; }

  get userId(): string { return this._userId; }
  set userId(userId: string) { this._userId = userId; }

  get username(): string { return this._username; }
  set username(username: string) { this._username = username; }

  get isTyping(): boolean { return this._isTyping; }
  set isTyping(isTyping: boolean) { this._isTyping = isTyping; }

  get additionalProperties(): Map<string, any> | undefined { return this._additionalProperties; }
  set additionalProperties(additionalProperties: Map<string, any> | undefined) { this._additionalProperties = additionalProperties; }
}
export { ChatTypingDto };