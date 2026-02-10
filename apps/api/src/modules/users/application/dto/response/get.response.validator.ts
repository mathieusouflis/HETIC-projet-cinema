import z from "zod";
import { returnedPaginationSchema } from "../../../../../shared/services/pagination";
import { publicUserValidator } from "../../validators/user.validator";
export const getResponseSchema = z.object({
  users: z.array(publicUserValidator),
  pagination: returnedPaginationSchema,
});

export type GetAllUsersResponse = z.infer<typeof getResponseSchema>;
