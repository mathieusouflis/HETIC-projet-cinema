import { createFileRoute } from "@tanstack/react-router";
import WatchlistPage from "@/features/watchlist";

export const Route = createFileRoute("/_main/watchlist/")({
  component: WatchlistPage,
});
