import { createFileRoute } from "@tanstack/react-router";
import { CommunityPage } from "@/features/community";

export const Route = createFileRoute("/_main/community/")({
  component: CommunityPage,
});
