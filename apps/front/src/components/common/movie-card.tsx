import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: GETContents200DataItemsItem;
  className?: string;
}

export const MovieCard = (props: MovieCardProps) => {
  const routes = useRoutes();

  return (
    <Link
      to={routes.contents.detail(props.movie.id)}
      className={cn("flex h-50 sm:h-80 aspect-5/8", props.className)}
    >
      {props.movie.posterUrl ? (
        <img
          className="h-full w-full object-cover rounded-3xl sm:rounded-4xl"
          src={props.movie.posterUrl}
          alt={props.movie.title}
        />
      ) : (
        <span className="h-full w-full bg-neutral-500 rounded-3xl sm:rounded-4xl" />
      )}
    </Link>
  );
};

export const MovieCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <Skeleton
      className={cn(
        "h-50 sm:h-80 rounded-3xl sm:rounded-3xl aspect-5/8",
        className
      )}
    />
  );
};
