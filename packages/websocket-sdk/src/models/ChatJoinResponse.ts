
class ChatJoinResponse {
  private _success: boolean;
  private _users: Map<string, any>[];
  private _error?: string;
  private _additionalProperties?: Map<string, any>;

  constructor(input: {
    success: boolean,
    users: Map<string, any>[],
    error?: string,
    additionalProperties?: Map<string, any>,
  }) {
    this._success = input.success;
    this._users = input.users;
    this._error = input.error;
    this._additionalProperties = input.additionalProperties;
  }

  get success(): boolean { return this._success; }
  set success(success: boolean) { this._success = success; }

  get users(): Map<string, any>[] { return this._users; }
  set users(users: Map<string, any>[]) { this._users = users; }

  get error(): string | undefined { return this._error; }
  set error(error: string | undefined) { this._error = error; }

  get additionalProperties(): Map<string, any> | undefined { return this._additionalProperties; }
  set additionalProperties(additionalProperties: Map<string, any> | undefined) { this._additionalProperties = additionalProperties; }
}
export { ChatJoinResponse };