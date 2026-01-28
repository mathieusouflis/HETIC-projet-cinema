import type z from "zod";
import { peopleValidator } from "../../validators/people.validator";

export const createPeopleResponseValidator = peopleValidator;

export type CreatePeopleResponse = z.infer<
  typeof createPeopleResponseValidator
>;
