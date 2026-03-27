import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getMovieByIdValidatorParams = z.object({
  id: uuidSchema,
});

export type GetMovieByIdValidatorParams = z.infer<
  typeof getMovieByIdValidatorParams
>;
