import type z from "zod";
import { publicUserValidator } from "../../validators/user.validator";

export const patchIdResponseSchema = publicUserValidator;

export type PatchIdResponseDTO = z.infer<typeof patchIdResponseSchema>;
