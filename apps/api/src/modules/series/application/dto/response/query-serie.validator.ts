import z from "zod";
import { serieSchema } from "../../schema/series.schema";

export const querySerieResponseSchema = z.array(serieSchema);

export type QuerySerieResponse = z.infer<typeof querySerieResponseSchema>;
