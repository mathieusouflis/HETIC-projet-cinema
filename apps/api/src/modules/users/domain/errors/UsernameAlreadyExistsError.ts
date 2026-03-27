import { ConflictError } from "../../../../shared/errors/conflict-error";

export class UsernameAlreadyExistsError extends ConflictError {
  constructor(username: string) {
    super(`A user with username "${username}" already exists`);
  }
}
