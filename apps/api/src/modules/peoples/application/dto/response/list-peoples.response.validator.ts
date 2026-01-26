import z from "zod";
import { peopleValidator } from "../../validators/people.validator";

export const ListPeoplesResponseValidator = peopleValidator.array();
export type ListPeoplesResponse = z.infer<typeof ListPeoplesResponseValidator>;
