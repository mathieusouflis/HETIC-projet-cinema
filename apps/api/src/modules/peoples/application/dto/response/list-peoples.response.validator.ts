import type z from "zod";
import { createOffsetPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas";
import { peopleValidator } from "../../validators/people.validator";

export const ListPeoplesResponseValidator =
  createOffsetPaginatedResponseSchema(peopleValidator);

export type ListPeoplesResponse = z.infer<typeof ListPeoplesResponseValidator>;
