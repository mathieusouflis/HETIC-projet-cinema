import { z } from "zod";
import { updateUserSchema } from "../validators/update-user.validator";

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
