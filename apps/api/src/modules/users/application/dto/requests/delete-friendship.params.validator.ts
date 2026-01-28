import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const deleteFriendshipParamsValidator = z.object({
  id: uuidSchema,
});

export type DeleteFriendshipParams = z.infer<
  typeof deleteFriendshipParamsValidator
>;
