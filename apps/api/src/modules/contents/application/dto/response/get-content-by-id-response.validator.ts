import z from "zod"
import { contentSchema } from "../../schema/contents.schema";

export const getContentByIdResponseSchema = contentSchema

export type GetContentByIdResponse = z.infer<typeof getContentByIdResponseSchema>;
