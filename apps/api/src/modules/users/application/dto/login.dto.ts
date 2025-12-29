import { z } from "zod";
import { loginSchema } from "../../../auth/application/validators/login.validator";

export type LoginUserDTO = z.infer<typeof loginSchema>;
