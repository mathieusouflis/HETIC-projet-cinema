import z from "zod";

export const searchPeopleParamsValidator = z.object({
  query: z.string().min(1, "Query must not be empty"),
  page: z.coerce.number().int().positive().optional().default(1),
});

export type SearchPeopleParams = z.infer<typeof searchPeopleParamsValidator>;
