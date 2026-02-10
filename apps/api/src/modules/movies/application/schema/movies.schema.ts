import z from "zod";
import { categoryResponseSchema } from "../../../../categories/application/dto/response/category.response.validator.js";
import { peopleValidator } from "../../../../peoples/application/validators/people.validator.js";
import { platformValidator } from "../../../../platforms/application/validators/platforms.validator.js";
import { seasonValidator } from "../../../../seasons/application/validators/seasons.validator.js";

export const movieSchema = z.object({
  id: z.uuid("Invalid UUID format for id"),
  type: z.enum(["movie"], "Type movie is required"),
  title: z.string("Title is required"),
  originalTitle: z.string().nullable(),
  slug: z.string().optional(),
  synopsis: z.string().nullable(),
  posterUrl: z.url("Invalid URL format for posterUrl").nullable(),
  backdropUrl: z.url("Invalid URL format for backdropUrl").nullable(),
  trailerUrl: z.url("Invalid URL format for trailerUrl").nullable(),
  releaseDate: z.date("Invalid date-time format for releaseDate").nullable(),
  year: z.number().int().min(1800, "Year must be 1800 or later").nullable(),
  durationMinutes: z
    .number()
    .int()
    .min(0, "Duration must be a positive integer")
    .nullable(),
  tmdbId: z.number().int().nullable(),
  averageRating: z
    .number()
    .min(0, "Average rating must be 0 or higher")
    .max(10, "Average rating must be 10 or lower"),
  totalRatings: z.number().int().min(0, "Total ratings must be 0 or higher"),
  totalViews: z.number().int().min(0, "Total views must be 0 or higher"),
  createdAt: z.date("Invalid date-time format for createdAt"),
  updatedAt: z.date("Invalid date-time format for updatedAt"),
  contentCategories: categoryResponseSchema.array().optional(),
  contentPlatforms: platformValidator.array().optional(),
  contentCredits: peopleValidator.array().optional(),
  seasons: seasonValidator.array().optional(),
});

export type MovieSchemaType = z.infer<typeof movieSchema>;
