import z from "zod";
import { uuidSchema } from "../../../../shared/schemas/fields";
import { contentCreditsValidator } from "../../../content-credits/application/validators/content-credits.validator.js";

export const peopleValidator = z.object({
  id: uuidSchema,
  name: z.string().min(2).max(100),
  bio: z.string().nullable(),
  photoUrl: z.url().nullable(),
  nationality: z.string().nullable(),
  birthDate: z.date().nullable(),
  tmdbId: z.number().int().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  contentCredits: contentCreditsValidator.array().optional(),
});
