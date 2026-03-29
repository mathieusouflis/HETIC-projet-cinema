import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import SearchPage from "@/features/search";

export const Route = createFileRoute("/_main/search/")({
  validateSearch: z.object({
    title: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    categories: z.array(z.string()).optional(),
  }),
  component: SearchPage,
});
