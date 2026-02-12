import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getApi } from "@/lib/api/services";
import { DisplayMovie, DisplayMovieSkeleton } from "./components/display-movie";
import { MovieCard, MovieCardSkeleton } from "./components/movie-card";

const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="text-2xl sm:text-3xl font-semibold">{children}</h2>;
};

export const HomePage = () => {
  const services = getApi();

  const { data, isLoading } = services.contents.discover({
    withCategory: "true",
  });

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    services.categories.list();

  let contents = data?.items;
  const categories = categoriesData?.items;

  let coverMovie: GETContents200DataItemsItem | undefined;

  if (contents?.[0]) {
    coverMovie = contents[0];
    contents = contents.slice(1);
  }

  return (
    <div className="flex flex-col gap-10">
      {isLoading ? (
        <DisplayMovieSkeleton />
      ) : coverMovie ? (
        <DisplayMovie movie={coverMovie} />
      ) : (
        <div>Loading...</div>
      )}
      <div className="flex flex-col gap-4 ">
        <SectionTitle>Genres</SectionTitle>
        {isCategoriesLoading ? (
          <div className="flex gap-3">
            {[...Array(5)].map((_, index) => (
              <Skeleton
                key={`category-skeleton-${index}`}
                className="w-40 h-19 rounded-full"
              />
            ))}
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-3 p-2 items-center">
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={"secondary"}
                  size={"2xl"}
                  className="py-7 sm:py-9"
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="opacity-0" />
          </ScrollArea>
        )}
      </div>
      <div className="flex flex-col gap-4 ">
        <SectionTitle>Trends</SectionTitle>
        <ScrollArea className="w-full">
          <div className="flex gap-5">
            {isLoading
              ? [...Array(5)].map((_, index) => (
                  <MovieCardSkeleton key={`trends-skeleton-${index}`} />
                ))
              : contents?.map((content) => (
                  <MovieCard key={`trends-${content.id}`} movie={content} />
                ))}
          </div>
          <ScrollBar orientation="horizontal" className="opacity-0" />
        </ScrollArea>
      </div>
    </div>
  );
};
