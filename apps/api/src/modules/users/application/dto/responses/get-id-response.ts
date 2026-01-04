import z from "zod";
import { publicUserSchema } from "../../schema/user.schema";

export const getIdResponseSchema = publicUserSchema;

export type GetIdResponseDTO = z.infer<typeof getIdResponseSchema>;
