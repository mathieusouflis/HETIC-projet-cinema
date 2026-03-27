import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getPeopleByIdParamsValidator = z.object({
  id: uuidSchema,
});

export type GetPeopleByIdParams = z.infer<typeof getPeopleByIdParamsValidator>;
