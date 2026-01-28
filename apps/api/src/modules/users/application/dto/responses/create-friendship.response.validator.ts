import type z from "zod";
import { friendshipValidator } from "../../validators/friendship.validator";

export const createFriendshipResponseValidator = friendshipValidator;
export type CreateFriendshipResponse = z.infer<
  typeof createFriendshipResponseValidator
>;
