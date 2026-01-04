import z from "zod";
import { publicUserSchema } from "../../../../users/application/schema/user.schema";

export const userProfileResponseValidator = publicUserSchema
export type UserProfileResponseDTO = z.infer<typeof userProfileResponseValidator>;
