import z from "zod";
import { publicUserSchema } from "../../schema/user.schema";
import { returnedPaginationSchema } from "../../../../../shared/schemas/base/pagination.schema";
export const getResponseSchema = z.object({
  users: z.array(
    publicUserSchema
  ),
  pagination: returnedPaginationSchema
});

export type GetResponseDTO = z.infer<typeof getResponseSchema>;
