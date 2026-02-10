import type z from "zod";
import { publicUserValidator } from "../../../../users/application/validators/user.validator";

export const userProfileResponseValidator = publicUserValidator;
export type UserProfileResponse = z.infer<typeof userProfileResponseValidator>;
