import z from "zod";
import { watchpartySchema } from "../../validators/watchparty.validators.js";

export const updateWatchpartyResponseValidator = watchpartySchema;
export type UpdateWatchpartyResponse = z.infer<typeof updateWatchpartyResponseValidator>;
