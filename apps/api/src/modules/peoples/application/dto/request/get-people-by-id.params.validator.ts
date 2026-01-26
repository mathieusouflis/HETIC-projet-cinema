import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const getPeopleByIdParamsValidator = z.object({
  id: uuidSchema,
});

export type GetPeopleByIdParams = z.infer<typeof getPeopleByIdParamsValidator>;
