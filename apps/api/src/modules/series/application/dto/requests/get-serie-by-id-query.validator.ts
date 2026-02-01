import z from "zod";

export const getSerieByIdValidatorQuery = z.object({
  withCategories: z.enum(["true", "false"]).optional(),
});

export type GetSerieByIdValidatorQuery = z.infer<
  typeof getSerieByIdValidatorQuery
>;
