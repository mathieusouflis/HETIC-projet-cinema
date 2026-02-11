import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoutes } from "@/lib/routes";

export interface DisplayMovieProps {
  movie: GETContents200DataItemsItem;
}

export const DisplayMovie = (props: DisplayMovieProps) => {
  const movie = props.movie;
  const routes = useRoutes();

  return (
    <div className="relative flex flex-col w-full">
      {movie.backdropUrl ? (
        <div className="relative w-full h-auto rounded-[28px] overflow-hidden aspect-13/6">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-black/80 to-black/0" />
        </div>
      ) : (
        <span className="w-full h-full object-cover rounded-[28px] bg-neutral-500" />
      )}
      <div className="absolute flex flex-col gap-10 bottom-12 left-12">
        <span className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            {movie.contentCategories?.map((category) => (
              <Badge size={"lg"} variant={"glass"} key={category.id}>
                {category.name}
              </Badge>
            ))}
          </div>
          <h2 className="text-6xl font-bold text-white">{movie.title}</h2>
          <p className="text-white max-w-1/3 line-clamp-4">{movie.synopsis}</p>
        </span>
        <Link to={routes.contents.detail(movie.id)} className="w-fit">
          <Button variant={"glass"} size={"2xl"} className="w-fit">
            Discover {movie.type}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const DisplayMovieSkeleton = () => {
  return <Skeleton className="w-full aspect-13/6 rounded-[28px]" />;
};
