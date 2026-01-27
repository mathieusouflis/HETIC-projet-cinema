import type z from "zod";
import { peopleValidator } from "../../validators/people.validator";

export const updatePeopleResponseValidator = peopleValidator;

export type UpdatePeopleResponse = z.infer<
  typeof updatePeopleResponseValidator
>;
