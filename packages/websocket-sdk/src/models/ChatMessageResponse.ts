
class ChatMessageResponse {
  private _success: boolean;
  private _messageId?: string;
  private _error?: string;
  private _timestamp: string;
  private _additionalProperties?: Map<string, any>;

  constructor(input: {
    success: boolean,
    messageId?: string,
    error?: string,
    timestamp: string,
    additionalProperties?: Map<string, any>,
  }) {
    this._success = input.success;
    this._messageId = input.messageId;
    this._error = input.error;
    this._timestamp = input.timestamp;
    this._additionalProperties = input.additionalProperties;
  }

  get success(): boolean { return this._success; }
  set success(success: boolean) { this._success = success; }

  get messageId(): string | undefined { return this._messageId; }
  set messageId(messageId: string | undefined) { this._messageId = messageId; }

  get error(): string | undefined { return this._error; }
  set error(error: string | undefined) { this._error = error; }

  get timestamp(): string { return this._timestamp; }
  set timestamp(timestamp: string) { this._timestamp = timestamp; }

  get additionalProperties(): Map<string, any> | undefined { return this._additionalProperties; }
  set additionalProperties(additionalProperties: Map<string, any> | undefined) { this._additionalProperties = additionalProperties; }
}
export { ChatMessageResponse };