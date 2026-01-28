import z from "zod";
import {
  limitSchema,
  pageSchema,
} from "../../../../../shared/schemas/base/pagination.schema.js";

export const searchPeopleParamsValidator = z.object({
  query: z.string().min(1, "Query must not be empty"),
  page: pageSchema,
  limit: limitSchema,
});

export type SearchPeopleParams = z.infer<typeof searchPeopleParamsValidator>;
