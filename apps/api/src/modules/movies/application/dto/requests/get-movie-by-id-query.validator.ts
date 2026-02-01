import z from "zod";

export const getMovieByIdValidatorQuery = z.object({
  withCategories: z.enum(["true", "false"]).optional(),
});

export type GetMovieByIdValidatorQuery = z.infer<
  typeof getMovieByIdValidatorQuery
>;
