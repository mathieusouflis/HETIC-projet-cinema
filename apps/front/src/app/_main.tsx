import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "@/components/layout/main";

export const Route = createFileRoute("/_main")({
  component: MainLayout,
});
