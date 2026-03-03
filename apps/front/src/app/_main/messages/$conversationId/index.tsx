import { createFileRoute } from "@tanstack/react-router";
import { ChatPanel } from "@/features/messages";

function ChatRoute() {
  const { conversationId } = Route.useParams();
  return <ChatPanel conversationId={conversationId} />;
}

export const Route = createFileRoute("/_main/messages/$conversationId/")({
  component: ChatRoute,
});
