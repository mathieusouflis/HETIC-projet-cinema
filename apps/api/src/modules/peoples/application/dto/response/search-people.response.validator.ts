import z from "zod";
import { peopleValidator } from "../../validators/people.validator";

export const searchPeopleResponseValidator = peopleValidator.array();

export type SearchPeopleResponse = z.infer<typeof searchPeopleResponseValidator>;
