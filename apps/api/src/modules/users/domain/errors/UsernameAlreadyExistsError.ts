import { ConflictError } from "../../../../shared/errors/index.js";

export class UsernameAlreadyExistsError extends ConflictError {
  constructor(username: string) {
    super(`A user with username "${username}" already exists`);
  }
}
