import { z } from "zod";
import { loginSchema } from "../validators/login.validator";

export type LoginDTO = z.infer<typeof loginSchema>;
