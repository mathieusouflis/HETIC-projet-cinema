import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const getMovieByIdValidatorParams = z.object({
  id: uuidSchema,
});

export type GetMovieByIdValidatorParams = z.infer<
  typeof getMovieByIdValidatorParams
>;
