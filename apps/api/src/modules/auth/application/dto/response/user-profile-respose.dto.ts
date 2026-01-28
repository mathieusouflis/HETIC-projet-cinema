import type z from "zod";
import { publicUserValidator } from "../../../../users/application/validators/user.validator";

export const userProfileResponseValidator = publicUserValidator;
export type UserProfileResponseDTO = z.infer<
  typeof userProfileResponseValidator
>;
