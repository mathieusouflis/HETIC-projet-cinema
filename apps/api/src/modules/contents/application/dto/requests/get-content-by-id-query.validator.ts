import z from "zod";

export const getContentByIdValidatorQuery = z.object({
  withCategory: z.enum(["true", "false"]).optional(),
  withPlatform: z.enum(["true", "false"]).optional(),
  withCast: z.enum(["true", "false"]).optional(),
  withSeasons: z.enum(["true", "false"]).optional(),
  withEpisodes: z.enum(["true", "false"]).optional(),
});

export type GetContentByIdValidatorQuery = z.infer<
  typeof getContentByIdValidatorQuery
>;
