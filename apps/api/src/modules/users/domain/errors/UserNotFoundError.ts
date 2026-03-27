import { NotFoundError } from "../../../../shared/errors/not-found-error";
export class UserNotFoundError extends NotFoundError {
  constructor(identifier?: string) {
    super(
      identifier ? `User with identifier "${identifier}" not found` : "User"
    );
  }
}
