import type z from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas";
import { peopleValidator } from "../../validators/people.validator";

export const searchPeopleResponseValidator =
  createPaginatedResponseSchema(peopleValidator);

export type SearchPeopleResponse = z.infer<
  typeof searchPeopleResponseValidator
>;
