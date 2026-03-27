import type { GETWatchlist200DataItemsItem } from "@packages/api-sdk";
import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/features/watchlist/components/rating";
import { useApi } from "@/lib/api/services";
import { contentService } from "@/lib/api/services/contents";
import { contentsKeys } from "@/lib/api/services/contents/keys";
import { baseRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  profileInsetPanelClassName,
  profileSectionCardClassName,
} from "./profile.styles";

type CompletedContent = Awaited<ReturnType<typeof contentService.get>>;

type CompletedItem = {
  watchlist: GETWatchlist200DataItemsItem;
  content: NonNullable<CompletedContent>;
};

const SKELETON_KEYS = ["left", "middle", "right"];
function SectionSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
      <div className="rounded-[28px] border p-4">
        <Skeleton className="h-52 w-full rounded-[22px]" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="aspect-[5/8] w-full rounded-[20px]" />
        ))}
      </div>
    </div>
  );
}

function EmptyShelf({ label }: { label: string }) {
  return (
    <div className="rounded-[24px] border border-dashed px-5 py-10 text-sm text-muted-foreground">
      {`No completed ${label.toLowerCase()} yet.`}
    </div>
  );
}

function PosterStack({ items }: { items: CompletedItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {items.map(({ content, watchlist }) => (
        <Link
          key={watchlist.id}
          to={baseRoutes.contents.detail(content.id)}
          className="group min-w-[110px] max-w-[110px] shrink-0"
        >
          <div className="relative overflow-hidden rounded-[20px] border bg-muted">
            {content.posterUrl ? (
              <img
                src={content.posterUrl}
                alt={content.title}
                className="aspect-[5/8] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="aspect-[5/8] w-full bg-muted" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3">
              <p className="line-clamp-2 text-sm font-medium text-white">
                {content.title}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function FeaturedShelf({
  label,
  featuredTitle,
  items,
  accentClassName,
}: {
  label: string;
  featuredTitle: string;
  items: CompletedItem[];
  accentClassName: string;
}) {
  if (items.length === 0) {
    return <EmptyShelf label={label} />;
  }

  const [featured, ...rest] = items;
  if (!featured) {
    return <EmptyShelf label={label} />;
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{featuredTitle}</h3>
        <p className="text-sm text-muted-foreground">
          {`Selection from your completed ${label.toLowerCase()}`}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Link
          to={baseRoutes.contents.detail(featured.content.id)}
          className={cn(
            "group overflow-hidden rounded-[28px] border p-4 transition-colors hover:bg-muted/20",
            accentClassName
          )}
        >
          <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[22px] bg-muted">
              {featured.content.posterUrl ? (
                <img
                  src={featured.content.posterUrl}
                  alt={featured.content.title}
                  className="aspect-[5/8] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="aspect-[5/8] w-full bg-muted" />
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xl font-semibold leading-tight">
                    {featured.content.title}
                  </h4>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {featured.content.synopsis ||
                      "Open this title to see more details."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <StarRating rating={featured.watchlist.rating ?? null} />
                  {!featured.watchlist.rating && (
                    <p className="text-sm text-muted-foreground">
                      No personal rating yet
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium underline-offset-4 group-hover:underline">
                  View
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className={cn("min-w-0 p-4", profileInsetPanelClassName)}>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Continue browsing completed titles
          </p>
          <PosterStack items={rest.length > 0 ? rest : items} />
        </div>
      </div>
    </section>
  );
}

export function CompletedContentSection() {
  const api = useApi();
  const { data, isLoading } = api.watchlist.list();

  const completedItems =
    data?.data.data.items
      .filter((item) => item.status === "completed")
      .sort((a, b) => {
        const first = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const second = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return second - first;
      }) ?? [];

  const completedContentQueries = useQueries({
    queries: completedItems.map((item) => ({
      queryKey: contentsKeys.get(item.contentId),
      queryFn: () => contentService.get(item.contentId),
    })),
  });

  const isCompletedContentLoading =
    isLoading || completedContentQueries.some((query) => query.isLoading);

  const completedEntries: CompletedItem[] = completedItems
    .map((watchlist, index) => {
      const content = completedContentQueries[index]?.data;

      if (!content) {
        return null;
      }

      return { watchlist, content };
    })
    .filter((item): item is CompletedItem => item !== null);

  const completedMovies = completedEntries.filter(
    (item) => item.content.type === "movie"
  );
  const completedSeries = completedEntries.filter(
    (item) => item.content.type === "serie"
  );

  return (
    <Card className={profileSectionCardClassName}>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Completed Universe</CardTitle>
            <p className="max-w-2xl text-sm text-muted-foreground">
              A curated view of everything you have finished, with your latest
              completions surfaced first.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {isCompletedContentLoading ? (
          <div className="space-y-8">
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        ) : completedEntries.length === 0 ? (
          <div className="rounded-[24px] border border-dashed bg-white/70 px-6 py-12 text-center text-sm text-muted-foreground">
            No completed titles yet. Finish a movie or a series and it will show
            up here.
          </div>
        ) : (
          <div className="space-y-10">
            <FeaturedShelf
              label="Movies"
              featuredTitle="Last film seen"
              items={completedMovies}
              accentClassName="border-amber-200/80 bg-amber-50/50"
            />
            <FeaturedShelf
              label="Series"
              featuredTitle="Last series seen"
              items={completedSeries}
              accentClassName="border-sky-200/80 bg-sky-50/50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
