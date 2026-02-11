import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoutes } from "@/lib/routes";

interface MovieCardProps {
  movie: GETContents200DataItemsItem;
}

export const MovieCard = (props: MovieCardProps) => {
  const routes = useRoutes();

  return (
    <Link
      to={routes.contents.detail(props.movie.id)}
      className="h-80 aspect-5/8 "
    >
      {props.movie.posterUrl ? (
        <img
          className="h-full w-full object-cover rounded-4xl"
          src={props.movie.posterUrl}
          alt={props.movie.title}
        />
      ) : (
        <span className="h-full w-full bg-neutral-500 rounded-4xl" />
      )}
    </Link>
  );
};

export const MovieCardSkeleton = () => {
  return <Skeleton className="h-80 rounded-3xl aspect-5/8" />;
};
