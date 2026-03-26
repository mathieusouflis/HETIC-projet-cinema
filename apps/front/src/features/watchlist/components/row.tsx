import type {
  GETContents200DataItemsItem,
  GETWatchlist200DataItemsItem,
} from "@packages/api-sdk";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/api/services";
import AddContentToWatchlistDialog from "./dialog";
import { StarRating } from "./rating";

export function WatchlistRow({
  item,
  rank,
}: {
  item: GETWatchlist200DataItemsItem;
  rank: number;
}) {
  const api = useApi();
  const { data: content, isLoading } = api.contents.get(item.contentId);

  if (isLoading) {
    return <WatchlistRowSkeleton />;
  }

  if (!content) return null;

  const categories = content.contentCategories
    ?.slice(0, 2)
    .map((c) => c.name)
    .filter(Boolean)
    .join(" · ");

  const subtitle = [content.year, categories].filter(Boolean).join(" · ");

  const progress =
    content.type === "serie" && item.currentEpisode != null
      ? `${item.currentSeason ?? 1} / ${item.currentEpisode}`
      : null;

  return (
    <div className="bg-card flex items-center gap-3 rounded-xl p-3 sm:gap-4 sm:p-4">
      {/* rank */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold text-neutral-700 dark:text-neutral-200 sm:h-7 sm:w-7">
        {rank}
      </div>

      {/* poster */}
      <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md sm:h-20 sm:w-14">
        {content.posterUrl ? (
          <img
            src={content.posterUrl}
            alt={content.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="bg-muted h-full w-full" />
        )}
      </div>

      {/* info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold leading-tight sm:text-base">
          {content.title}
        </p>
        {subtitle && (
          <p className="text-muted-foreground mt-0.5 truncate text-xs sm:text-sm">
            {subtitle}
          </p>
        )}
        {/* progress on mobile */}
        {progress && (
          <p className="text-muted-foreground mt-0.5 text-xs sm:hidden">
            Ep {progress}
          </p>
        )}
      </div>

      {/* progress — desktop only */}
      <div className="text-muted-foreground hidden w-14 shrink-0 text-center text-sm sm:block">
        {progress ?? "—"}
      </div>

      {/* rating — desktop only */}
      <div className="hidden shrink-0 sm:block">
        <StarRating rating={item.rating ?? null} />
      </div>

      {/* edit */}
      <AddContentToWatchlistDialog
        content={content as unknown as GETContents200DataItemsItem}
        variant="edit"
      >
        <Button variant="outline" size="icon-lg" aria-label="Edit">
          <Pencil />
        </Button>
      </AddContentToWatchlistDialog>
    </div>
  );
}

export function WatchlistRowSkeleton() {
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl p-3 sm:gap-4 sm:p-4">
      <Skeleton className="h-8 w-8 shrink-0 rounded-md sm:h-9 sm:w-9" />
      <Skeleton className="h-16 w-11 shrink-0 rounded-md sm:h-20 sm:w-14" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="hidden h-4 w-12 sm:block" />
      <Skeleton className="hidden h-4 w-20 sm:block" />
      <Skeleton className="size-8 shrink-0 rounded-full" />
    </div>
  );
}
