import z from "zod";
import { returnedPaginationSchema } from "../../../../../shared/schemas/base/pagination.schema";
import { publicUserValidator } from "../../validators/user.validator";
export const getResponseSchema = z.object({
  users: z.array(publicUserValidator),
  pagination: returnedPaginationSchema,
});

export type GetResponseDTO = z.infer<typeof getResponseSchema>;
