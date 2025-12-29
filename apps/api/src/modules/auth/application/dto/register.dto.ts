import { z } from "zod";
import { registerSchema } from "../validators/register.validator";

export type RegisterDTO = z.infer<typeof registerSchema>;
