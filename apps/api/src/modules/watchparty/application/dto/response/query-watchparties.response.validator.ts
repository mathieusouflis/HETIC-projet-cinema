import z from "zod";
import { watchpartySchema } from "../../validators/watchparty.validators.js";

export const queryWatchpartiesResponseValidator = z.array(watchpartySchema);
export type QueryWatchpartiesResponse = z.infer<
  typeof queryWatchpartiesResponseValidator
>;
