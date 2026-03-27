import { ConflictError } from "../../../../shared/errors/conflict-error";

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
  }
}
