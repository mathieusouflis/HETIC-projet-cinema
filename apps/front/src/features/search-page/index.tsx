import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApi } from "@/lib/api/services";
import { useRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type SearchTab = "popular" | "new" | "upcoming";

export function SearchPage({
  initialQuery = "",
  onQueryChange,
}: {
  initialQuery?: string;
  onQueryChange?: (q: string) => void;
}) {
  const routes = useRoutes();
  const { contents: contentService } = getApi();

  const [tab, setTab] = useState<SearchTab>("popular");
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(handler);
  }, [query]);

  const { data, isLoading } = contentService.discover({
    title: debouncedQuery || undefined,
    withCategory: "true",
    withPlatform: "true",
    limit: 40,
  });

  const items = data?.items ?? [];

  const filteredItems = useMemo(() => {
    const withDate = items
      .map((it) => ({
        item: it,
        releaseMs: it.releaseDate ? Date.parse(it.releaseDate) : Number.NaN,
      }))
      .filter((x) => x.item.posterUrl || x.item.backdropUrl);

    if (tab === "popular") return withDate.map((x) => x.item);

    if (tab === "new") {
      return withDate
        .slice()
        .sort((a, b) => (b.releaseMs || 0) - (a.releaseMs || 0))
        .map((x) => x.item);
    }

    // upcoming
    const now = Date.now();
    return withDate
      .filter((x) => !Number.isNaN(x.releaseMs) && x.releaseMs >= now)
      .sort((a, b) => (a.releaseMs || 0) - (b.releaseMs || 0))
      .map((x) => x.item);
  }, [items, tab]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as SearchTab)}>
          <TabsList variant="line" className="p-0">
            <TabsTrigger value="popular" className="px-0">
              Popular
            </TabsTrigger>
            <TabsTrigger value="new" className="px-0">
              New
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="px-0">
              Upcoming
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-xl">
            <Input
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                onQueryChange?.(next);
              }}
              placeholder="Search movies or TV shows..."
              className="h-11 rounded-full pl-11 pr-4"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="size-5" />
            </span>
          </div>
        </div>

        <p className="hidden sm:block text-sm text-muted-foreground whitespace-nowrap">
          Powered by FineTune
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as SearchTab)}>
        <TabsContent value="popular">
          <PosterGrid
            isLoading={isLoading}
            items={filteredItems}
            emptyLabel={
              debouncedQuery ? "No results found" : "No content found"
            }
            detailRoute={(id) => routes.contents.detail(id)}
          />
        </TabsContent>
        <TabsContent value="new">
          <PosterGrid
            isLoading={isLoading}
            items={filteredItems}
            emptyLabel={
              debouncedQuery ? "No results found" : "No content found"
            }
            detailRoute={(id) => routes.contents.detail(id)}
          />
        </TabsContent>
        <TabsContent value="upcoming">
          <PosterGrid
            isLoading={isLoading}
            items={filteredItems}
            emptyLabel={
              debouncedQuery ? "No results found" : "No upcoming content found"
            }
            detailRoute={(id) => routes.contents.detail(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PosterGrid({
  items,
  isLoading,
  emptyLabel,
  detailRoute,
}: {
  items: GETContents200DataItemsItem[];
  isLoading: boolean;
  emptyLabel: string;
  detailRoute: (id: string) => string;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {new Array(12).fill(null).map((_, i) => (
          <PosterCardSkeleton key={`poster-skel-${i}`} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <PosterCard key={item.id} item={item} detailRoute={detailRoute} />
      ))}
    </div>
  );
}

function PosterCard({
  item,
  detailRoute,
}: {
  item: GETContents200DataItemsItem;
  detailRoute: (id: string) => string;
}) {
  const year =
    item.year ??
    (item.releaseDate?.trim()
      ? new Date(item.releaseDate).getFullYear() || null
      : null);

  const platformsCount = item.contentPlatforms?.length ?? 0;

  return (
    <Link to={detailRoute(item.id)} className="group flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium truncate">{item.title}</p>
        <p className="text-sm text-muted-foreground tabular-nums">
          {year ?? "—"}
        </p>
      </div>

      <div className="relative w-full aspect-5/8 overflow-hidden rounded-3xl bg-muted">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-muted-foreground/30" />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p className="truncate">
          {platformsCount > 0
            ? `Available on ${platformsCount} platform${
                platformsCount > 1 ? "s" : ""
              }`
            : "Availability unknown"}
        </p>
        <span className="text-foreground/70 group-hover:text-foreground transition-colors whitespace-nowrap">
          See details
        </span>
      </div>
    </Link>
  );
}

function PosterCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-10 rounded-md" />
      </div>
      <Skeleton className={cn("w-full aspect-5/8 rounded-3xl")} />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
    </div>
  );
}
