import { NotFoundError } from "../../../../shared/errors/index.js";

export class UserNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super(
      identifier ? `User with identifier "${identifier}" not found` : "User",
    );
  }
}
