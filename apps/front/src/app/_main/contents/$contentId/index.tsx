import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/features/content/indext";

export const Route = createFileRoute("/_main/contents/$contentId/")({
  component: ContentPage,
});
