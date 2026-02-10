import type z from "zod";
import { publicUserValidator } from "../../validators/user.validator";

export const getIdResponseSchema = publicUserValidator;

export type GetIdResponse = z.infer<typeof getIdResponseSchema>;
