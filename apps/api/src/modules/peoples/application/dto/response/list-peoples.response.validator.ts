import type z from "zod";
import { createOffsetPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { peopleValidator } from "../../validators/people.validator.js";

export const ListPeoplesResponseValidator =
  createOffsetPaginatedResponse(peopleValidator);

export type ListPeoplesResponse = z.infer<typeof ListPeoplesResponseValidator>;
