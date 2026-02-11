import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getApi } from "@/lib/api/services";
import { DisplayMovie, DisplayMovieSkeleton } from "./components/display-movie";

export const HomePage = () => {
  const services = getApi();

  const { data, isLoading } = services.contents.discover({
    title: "spiderman",
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
      <div className="flex flex-col gap-4 font-medium">
        <h1 className="text-3xl">Genres</h1>
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
            <div className="flex gap-3 pb-4">
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={"secondary"}
                  size={"2xl"}
                  className="py-9"
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="opacity-0" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
