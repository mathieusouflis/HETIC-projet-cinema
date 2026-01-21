import { NotFoundError } from "../../../../../../../shared/errors";

export class MetadataNotFoundError extends NotFoundError {
  constructor(path: string) {
    super("Metadata not found for path: " + path);
  }
}
