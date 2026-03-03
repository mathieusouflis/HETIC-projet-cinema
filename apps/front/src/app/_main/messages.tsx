import { createFileRoute } from "@tanstack/react-router";
import { MessagesLayout } from "@/features/messages";

export const Route = createFileRoute("/_main/messages")({
  component: MessagesLayout,
});
