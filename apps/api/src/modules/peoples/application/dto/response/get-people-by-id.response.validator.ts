import z from "zod";
import { peopleValidator } from "../../validators/people.validator";

export const getPeopleByIdResponseValidator = peopleValidator;

export type GetPeopleByIdResponse = z.infer<typeof getPeopleByIdResponseValidator>;
