import type { GETWatchlist200DataItemsItemStatus } from "@packages/api-sdk";

export const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "plan_to_watch", label: "Plan to watch" },
  { value: "dropped", label: "Dropped" },
  { value: "undecided", label: "Undecided" },
  { value: "not_interested", label: "Not Interested" },
] as const;

export const STATUS_ORDER: GETWatchlist200DataItemsItemStatus[] = [
  "watching",
  "plan_to_watch",
  "completed",
  "dropped",
  "undecided",
  "not_interested",
];

export const STATUS_LABELS: Record<GETWatchlist200DataItemsItemStatus, string> =
  {
    watching: "Watching",
    plan_to_watch: "Plan to Watch",
    completed: "Completed",
    dropped: "Dropped",
    undecided: "Undecided",
    not_interested: "Not Interested",
  };
