import type z from "zod";
import { watchpartySchema } from "../../validators/watchparty.validators";

export const createWatchpartyResponseValidator = watchpartySchema;
export type CreateWatchpartyResponse = z.infer<
  typeof createWatchpartyResponseValidator
>;
