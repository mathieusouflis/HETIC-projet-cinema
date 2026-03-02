import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import SearchPage from "@/features/search";

export const Route = createFileRoute("/_main/search/")({
  validateSearch: z.object({
    title: z.string().optional(),
    page: z.number().int().min(1).optional().default(1),
    actorsPage: z.number().int().min(1).optional().default(1),
    year: z.number().int().min(1900).max(2100).optional(),
    minRating: z.number().min(0).max(10).optional(),
    categories: z.array(z.string()).optional(),
  }),
  component: SearchPage,
});
