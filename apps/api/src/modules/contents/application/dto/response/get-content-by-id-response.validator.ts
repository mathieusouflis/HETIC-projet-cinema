import type z from "zod";
import { createSuccessResponseSchema } from "../../../../../shared/schemas/base";
import { contentSchema } from "../../schema/contents.schema";

export const getContentByIdResponseSchema =
  createSuccessResponseSchema(contentSchema);

export type GetContentByIdResponse = z.infer<
  typeof getContentByIdResponseSchema
>;
