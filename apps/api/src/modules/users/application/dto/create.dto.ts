import { z } from "zod";
import { createUserSchema } from "../validators/create-user.validator";

export type CreateUserDTO = z.infer<typeof createUserSchema>;
