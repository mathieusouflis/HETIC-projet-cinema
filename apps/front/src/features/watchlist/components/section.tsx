import type { GETWatchlist200DataItemsItem } from "@packages/api-sdk";
import { WatchlistRow } from "./row";

export function WatchlistSection({
  items,
}: {
  items: GETWatchlist200DataItemsItem[];
}) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <WatchlistRow key={item.id} item={item} rank={i + 1} />
      ))}
    </div>
  );
}
