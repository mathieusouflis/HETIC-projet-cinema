import type z from "zod";
import { publicUserValidator } from "../../validators/user.validator";

export const patchIdResponseSchema = publicUserValidator;

export type PatchIdResponse = z.infer<typeof patchIdResponseSchema>;
