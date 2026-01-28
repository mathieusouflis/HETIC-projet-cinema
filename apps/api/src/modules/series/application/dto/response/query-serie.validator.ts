import type z from "zod";
import { createPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { serieSchema } from "../../schema/series.schema.js";

export const querySerieResponseSchema = createPaginatedResponse(serieSchema);

export type QuerySerieResponse = z.infer<typeof querySerieResponseSchema>;
