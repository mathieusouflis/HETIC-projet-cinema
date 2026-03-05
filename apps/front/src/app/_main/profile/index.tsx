import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/profile";

export const Route = createFileRoute("/_main/profile/")({
  component: ProfilePage,
});
