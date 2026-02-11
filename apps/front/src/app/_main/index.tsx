import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/explore";

export const Route = createFileRoute("/_main/")({
  component: HomePage,
});
