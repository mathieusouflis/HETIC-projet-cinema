import z from "zod";
import { publicUserValidator } from "../../validators/user.validator";

export const getFollowersFollowingResponseValidator =
  z.array(publicUserValidator);

export type GetFollowersFollowingResponse = z.infer<
  typeof getFollowersFollowingResponseValidator
>;
