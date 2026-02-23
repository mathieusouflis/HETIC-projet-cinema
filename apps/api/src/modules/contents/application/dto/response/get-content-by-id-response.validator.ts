import type z from "zod";
import { createSuccessResponseSchema } from "../../../../../shared/schemas/base";
import { categoryResponseSchema } from "../../../../categories/application/dto/response";
import { peopleValidator } from "../../../../peoples/application/validators/people.validator";
import { platformValidator } from "../../../../platforms/application/validators/platforms.validator";
import { seasonValidator } from "../../../../seasons/application/validators/seasons.validator";
import { contentSchema } from "../../schema/contents.schema";

export const getContentByIdResponseSchema = createSuccessResponseSchema(
  contentSchema.extend({
    contentCategories: categoryResponseSchema.array().optional(),
    contentPlatforms: platformValidator.array().optional(),
    contentCredits: peopleValidator.array().optional(),
    seasons: seasonValidator.array().optional(),
  })
);

export type GetContentByIdResponse = z.infer<
  typeof getContentByIdResponseSchema
>;
