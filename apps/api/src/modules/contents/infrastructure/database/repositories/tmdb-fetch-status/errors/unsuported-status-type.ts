import { logger } from "@packages/logger";
import { ServerError } from "../../../../../../../shared/errors/ServerError";

export class UnsupportedStatusTypeError extends ServerError {
  constructor(type: string) {
    super();
    logger.error(`Unsupported status type: ${type}`);
  }
}
