import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Link } from "@tanstack/react-router";
import { Pen, Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddContentToWatchlistDialog from "@/features/watchlist/components/dialog";
import { useApi } from "@/lib/api/services";
import { baseRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type ContentCardVariant = "thumbnail" | "hero" | "result";

interface ContentCardProps {
  content: GETContents200DataItemsItem;
  variant: ContentCardVariant;
  inWatchlist?: boolean;
  className?: string;
}

export const ContentCard = ({
  content,
  variant,
  className,
}: ContentCardProps) => {
  const services = useApi();

  const { data, isLoading } = services.watchlist.list();

  if (variant === "thumbnail")
    return <ThumbnailCard content={content} className={className} />;
  if (variant === "hero") return <HeroCard content={content} />;

  if (isLoading) {
    return null;
  }
  console.log(data);
  return (
    <ResultCard
      content={content}
      className={className}
      isInWatchlist={
        data?.data.data.items.find((item) => item.contentId === content.id) !==
        undefined
      }
    />
  );
};

interface ContentCardSkeletonProps {
  variant: ContentCardVariant;
  className?: string;
}

export const ContentCardSkeleton = ({
  variant,
  className,
}: ContentCardSkeletonProps) => {
  if (variant === "thumbnail") {
    return (
      <Skeleton
        className={cn(
          "h-50 sm:h-80 rounded-3xl sm:rounded-4xl aspect-5/8",
          className
        )}
      />
    );
  }
  if (variant === "hero") {
    return (
      <Skeleton
        className={cn("w-full aspect-13/6 rounded-[28px]", className)}
      />
    );
  }
  return (
    <div className="flex items-start gap-4 py-5">
      <Skeleton className="w-28 lg:w-36 h-40 lg:h-52 rounded-2xl shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
};

// ---- Thumbnail variant (formerly MovieCard) ----

function ThumbnailCard({
  content,
  className,
}: {
  content: GETContents200DataItemsItem;
  className?: string;
}) {
  return (
    <Link
      to={baseRoutes.contents.detail(content.id)}
      className={cn("flex h-50 sm:h-80 aspect-5/8", className)}
    >
      {content.posterUrl ? (
        <img
          className="h-full w-full object-cover rounded-3xl sm:rounded-4xl"
          src={content.posterUrl}
          alt={content.title}
        />
      ) : (
        <span className="h-full w-full bg-neutral-500 rounded-3xl sm:rounded-4xl" />
      )}
    </Link>
  );
}

// ---- Hero variant (formerly DisplayMovie) ----

function HeroCard({ content }: { content: GETContents200DataItemsItem }) {
  return (
    <>
      <Link
        to={baseRoutes.contents.detail(content.id)}
        className="lg:pointer-events-none block lg:hidden"
      >
        <HeroCardContent content={content} />
      </Link>
      <HeroCardContent content={content} className="hidden lg:block" />
    </>
  );
}

function HeroCardContent({
  content,
  className,
}: {
  content: GETContents200DataItemsItem;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col w-full", className)}>
      {content.backdropUrl ? (
        <div className="relative w-full h-auto rounded-[28px] overflow-hidden aspect-13/6">
          <img
            src={content.backdropUrl}
            alt={content.title}
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-black/80 to-black/0" />
        </div>
      ) : (
        <span className="w-full h-full object-cover rounded-[28px] bg-neutral-500" />
      )}
      <div className="absolute flex flex-col gap-10 bottom-5 left-5 sm:bottom-12 sm:left-12">
        <span className="flex flex-col gap-5">
          <div className="sm:flex flex-wrap gap-1.5 hidden">
            {content.contentCategories?.map((category) => (
              <Badge size="lg" variant="glass" key={category.id}>
                {category.name}
              </Badge>
            ))}
          </div>
          <h2 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-white">
            {content.title}
          </h2>
          <p className="text-white w-1/3 line-clamp-4 hidden xl:block">
            {content.synopsis}
          </p>
        </span>
        <Link
          to={baseRoutes.contents.detail(content.id)}
          className="hidden xl:block"
        >
          <Button variant="glass" size="2xl" className="w-fit hidden md:block">
            Discover {content.type}
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---- Result variant (formerly ContentResultCard) ----

function ResultCard({
  content,
  isInWatchlist,
  className,
}: {
  content: GETContents200DataItemsItem;
  isInWatchlist: boolean;
  className?: string;
}) {
  const year =
    content.year ??
    (content.releaseDate?.trim()
      ? new Date(content.releaseDate).getFullYear()
      : null);

  const allActors = content.contentCredits ?? [];
  const visibleActors = allActors.slice(0, 3);
  const extraActors = allActors.slice(3);
  const country = content.contentCredits?.[0]?.nationality;
  const categories = content.contentCategories ?? [];
  const visibleCategories = categories.slice(0, 3);
  const extraCategories = categories.slice(3);

  return (
    <div className={cn("flex items-start gap-4 py-5", className)}>
      <Link to={baseRoutes.contents.detail(content.id)} className="shrink-0">
        {content.posterUrl ? (
          <img
            src={content.posterUrl}
            alt={content.title}
            className="w-28 lg:w-36 h-40 lg:h-52 object-cover rounded-2xl"
          />
        ) : (
          <span className="block w-28 lg:w-36 h-40 lg:h-52 bg-muted rounded-2xl" />
        )}
      </Link>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <Link to={baseRoutes.contents.detail(content.id)}>
          <h3 className="text-lg font-bold leading-tight hover:underline">
            {content.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground">
          {[year, country].filter(Boolean).join(" - ")}
        </p>

        {visibleCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {visibleCategories.map((category) => (
              <Badge key={category.id} variant="secondary" size="sm">
                {category.name}
              </Badge>
            ))}
            {extraCategories.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      size="sm"
                      className="cursor-default"
                    >
                      +{extraCategories.length}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{extraCategories.map((c) => c.name).join(", ")}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {(content.totalRatings ?? 0) > 0 && (
          <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
            <Star className="size-3.5 fill-amber-500" />
            {Number(content.averageRating).toFixed(1)}
            <span className="text-muted-foreground font-normal">
              ({content.totalRatings})
            </span>
          </span>
        )}

        {visibleActors.length > 0 && (
          <div className="hidden lg:flex flex-col gap-1 mt-1">
            <p className="text-xs font-medium text-muted-foreground">Actors</p>
            <div className="flex gap-3 flex-wrap items-center">
              {visibleActors.map((actor) => (
                <span
                  key={actor.id}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  {actor.photoUrl ? (
                    <img
                      src={actor.photoUrl}
                      alt={actor.name}
                      className="size-6 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span className="size-6 rounded-full bg-muted block shrink-0" />
                  )}
                  {actor.name} ↘
                </span>
              ))}
              {extraActors.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        size="sm"
                        className="cursor-default"
                      >
                        +{extraActors.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-0.5">
                        {extraActors.map((a) => (
                          <span key={a.id}>{a.name}</span>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {content.synopsis && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            <p className="hidden lg:block text-xs font-medium text-muted-foreground">
              Synopsis
            </p>
            <p className="text-sm text-muted-foreground line-clamp-3 lg:line-clamp-5">
              {content.synopsis}
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 ml-2">
        <AddContentToWatchlistDialog
          variant={isInWatchlist ? "edit" : "new"}
          content={content}
        >
          <Button
            size="icon-lg"
            className="rounded-full bg-foreground text-background hover:bg-foreground/80"
          >
            {isInWatchlist ? <Pen /> : <Plus />}
          </Button>
        </AddContentToWatchlistDialog>
      </div>
    </div>
  );
}
