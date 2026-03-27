import type z from "zod";
import { categoryResponseSchema } from "../../../../categories/application/dto/response/category.response.validator";
import { peopleValidator } from "../../../../peoples/application/validators/people.validator";
import { platformValidator } from "../../../../platforms/application/validators/platforms.validator";
import { seasonValidator } from "../../../../seasons/application/validators/seasons.validator";
import { serieSchema } from "../../schema/series.schema";

export const getSerieByIdResponseSchema = serieSchema.extend({
  contentCategories: categoryResponseSchema.array().optional(),
  contentPlatforms: platformValidator.array().optional(),
  contentCredits: peopleValidator.array().optional(),
  seasons: seasonValidator.array().optional(),
});

export type GetSerieByIdResponse = z.infer<typeof getSerieByIdResponseSchema>;
