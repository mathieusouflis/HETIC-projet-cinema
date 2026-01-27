import type z from "zod";
import { publicUserSchema } from "../../schema/user.schema";

export const patchIdResponseSchema = publicUserSchema;

export type PatchIdResponseDTO = z.infer<typeof patchIdResponseSchema>;
