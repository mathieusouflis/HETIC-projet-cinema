import type z from "zod";
import { watchpartySchema } from "../../validators/watchparty.validators";

export const updateWatchpartyResponseValidator = watchpartySchema;
export type UpdateWatchpartyResponse = z.infer<
  typeof updateWatchpartyResponseValidator
>;
