import { createFileRoute } from "@tanstack/react-router";
import WatchPartyPage from "@/features/watchlist";

export const Route = createFileRoute("/_main/watchparty/")({
  component: WatchPartyPage,
});
