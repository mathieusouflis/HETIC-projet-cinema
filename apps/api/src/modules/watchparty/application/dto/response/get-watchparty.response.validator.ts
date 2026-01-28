import type z from "zod";
import { watchpartySchema } from "../../validators/watchparty.validators.js";

export const getWatchpartyResponseValidator = watchpartySchema;
export type GetWatchpartyResponse = z.infer<
  typeof getWatchpartyResponseValidator
>;
