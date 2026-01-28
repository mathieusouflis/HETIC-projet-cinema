import type z from "zod";
import { serieSchema } from "../../schema/series.schema";

export const getSerieByIdResponseSchema = serieSchema;

export type GetSerieByIdResponse = z.infer<typeof getSerieByIdResponseSchema>;
