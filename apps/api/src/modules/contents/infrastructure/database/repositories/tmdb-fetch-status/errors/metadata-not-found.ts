import { NotFoundError } from "../../../../../../../shared/errors/not-found-error";

export class MetadataNotFoundError extends NotFoundError {
  constructor(path: string) {
    super(`Metadata not found for path: ${path}`);
  }
}
