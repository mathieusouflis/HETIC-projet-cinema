import { ConflictError } from "../../../../shared/errors/index.js";

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
  }
}
