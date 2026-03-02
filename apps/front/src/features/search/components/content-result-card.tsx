import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Link } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { baseRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface ContentResultCardProps {
  content: GETContents200DataItemsItem;
  className?: string;
}

export const ContentResultCard = ({
  content,
  className,
}: ContentResultCardProps) => {
  const year =
    content.year ??
    (content.releaseDate?.trim()
      ? new Date(content.releaseDate).getFullYear()
      : null);

  const category = content.contentCategories?.[0]?.name;
  const actors = content.contentCredits?.slice(0, 2) ?? [];
  const country = content.contentCredits?.[0]?.nationality;

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
          {[year, category, country].filter(Boolean).join(" - ")}
        </p>

        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-semibold w-fit">
          <Star className="size-3 fill-amber-500 stroke-amber-500" />
          {content.averageRating.toFixed(1)}
        </span>

        {actors.length > 0 && (
          <div className="hidden lg:flex flex-col gap-1 mt-1">
            <p className="text-xs font-medium text-muted-foreground">Actors</p>
            <div className="flex gap-3 flex-wrap">
              {actors.map((actor) => (
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

      <div className="shrink-0 self-center ml-2">
        <Button
          size="icon-2xl"
          className="rounded-full bg-foreground text-background hover:bg-foreground/80"
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
};

export const ContentResultCardSkeleton = () => (
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
