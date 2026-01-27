import type z from "zod";
import { publicUserValidator } from "../../validators/user.validator";

export const getIdResponseSchema = publicUserValidator;

export type GetIdResponseDTO = z.infer<typeof getIdResponseSchema>;
