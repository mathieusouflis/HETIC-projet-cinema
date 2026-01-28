import type z from "zod";
import { createPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { peopleValidator } from "../../validators/people.validator.js";

export const searchPeopleResponseValidator =
  createPaginatedResponse(peopleValidator);

export type SearchPeopleResponse = z.infer<
  typeof searchPeopleResponseValidator
>;
