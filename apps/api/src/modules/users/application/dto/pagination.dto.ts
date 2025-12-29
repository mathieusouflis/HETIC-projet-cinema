import { z } from "zod";
import { paginationSchema } from "../validators/pagination.validator";

export type PaginationDTO = z.infer<typeof paginationSchema>;
