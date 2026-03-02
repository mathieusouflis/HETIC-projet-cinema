import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/lib/api/services";
import { ContentCard, ContentCardSkeleton } from "./components/content-card";

export const SearchResults = ({
  query,
  onClick,
}: {
  query: string;
  onClick: () => void;
}) => {
  const api = useApi();
  const { data, isLoading } = api.contents.discover({
    title: query,
    withCategory: "true",
  });

  const contents = data?.items;

  if (!contents && !isLoading) {
    return <div>No results found</div>;
  }

  const movies = contents?.filter((content) => content.type === "movie") ?? [];
  const series = contents?.filter((content) => content.type === "serie") ?? [];

  const loadingSkeleton = (
    <>
      {[...Array(10)].map((_, index) => (
        <ContentCardSkeleton key={`skeleton-${index}`} />
      ))}
    </>
  );

  return (
    <Tabs defaultValue="all">
      <div className="sticky top-0 w-full bg-linear-to-b from-white from-80% to-white/0 pb-4">
        <TabsList variant={"none"}>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
        </TabsList>
      </div>
      <TabGrid value="all">
        <div className="col-span-full flex flex-col gap-6">
          <TabGridSection title="Movies">
            {isLoading ? (
              loadingSkeleton
            ) : movies.length > 0 ? (
              renderContentsComponents(movies, onClick)
            ) : (
              <p className="col-span-full text-muted-foreground">
                No movies found
              </p>
            )}
          </TabGridSection>
          <TabGridSection title="Series">
            {isLoading ? (
              loadingSkeleton
            ) : series.length > 0 ? (
              renderContentsComponents(series, onClick)
            ) : (
              <p className="col-span-full text-muted-foreground">
                No series found
              </p>
            )}
          </TabGridSection>
        </div>
      </TabGrid>
      <TabGrid value="movies">
        {isLoading
          ? loadingSkeleton
          : renderContentsComponents(movies, onClick)}
      </TabGrid>
      <TabGrid value="series">
        {isLoading
          ? loadingSkeleton
          : renderContentsComponents(series, onClick)}
      </TabGrid>
    </Tabs>
  );
};

function renderContentsComponents(
  contents: GETContents200DataItemsItem[],
  onClick: () => void
) {
  return contents.map((content, idx) => (
    <ContentCard
      key={idx}
      id={content.id}
      title={content.title}
      year={
        content.releaseDate?.trim()
          ? new Date(content.releaseDate).getFullYear() || null
          : null
      }
      category={content.contentCategories?.[0]?.name || "Unknown"}
      posterUrl={content.posterUrl}
      className="col-span-2"
      onClick={onClick}
    />
  ));
}

function TabGridSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-muted-foreground ">{title}</p>
      <div className="grid grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

function TabGrid({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <TabsContent value={value} className="grid grid-cols-4 gap-4">
      {children}
    </TabsContent>
  );
}
