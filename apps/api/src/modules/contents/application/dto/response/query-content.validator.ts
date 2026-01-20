import z from "zod";
import { contentSchema } from "../../schema/contents.schema";

export const queryContentResponseSchema = z.array(contentSchema)

export type QueryContentResponse = z.infer<typeof queryContentResponseSchema>;
