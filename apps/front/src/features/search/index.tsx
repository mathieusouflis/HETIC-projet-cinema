import type { GETContents200DataItemsItemContentCreditsItem } from "@packages/api-sdk";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import {
  ContentCard,
  ContentCardSkeleton,
} from "@/components/common/content-card";
import {
  PersonCard,
  PersonCardSkeleton,
} from "@/components/common/person-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/lib/api/services";
import { SearchBar } from "./components/search-bar";
import { type FilterValues, SearchFilters } from "./components/search-filters";

export default function SearchPage() {
  const params = useSearch({ from: "/_main/search/" });
  const navigate = useNavigate();

  const page = params.page ?? 1;
  const title = params.title ?? "";
  const year = params.year;
  const minRating = params.minRating;
  const categories = params.categories;

  const [activeTab, setActiveTab] = useState("top");

  const services = useApi();

  const { data, isLoading } = services.contents.discover(
    {
      title: params.title,
      withCategory: "true",
      withCast: "true",
      page,
      year,
      categories,
      averageRating: minRating,
    },
    { enabled: activeTab !== "actors" }
  );

  const { data: actorsData, isLoading: isActorsLoading } =
    services.peoples.search(
      { query: title || " " },
      { enabled: activeTab === "actors" }
    );

  const contents = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const movies = contents.filter((c) => c.type === "movie");
  const tvShows = contents.filter((c) => c.type === "serie");

  const peopleMap = new Map<
    string,
    {
      person: GETContents200DataItemsItemContentCreditsItem;
      relatedContents: typeof contents;
    }
  >();
  for (const content of contents) {
    for (const person of content.contentCredits ?? []) {
      const existing = peopleMap.get(person.id);
      if (existing) {
        existing.relatedContents.push(content);
      } else {
        peopleMap.set(person.id, { person, relatedContents: [content] });
      }
    }
  }
  const topPeople = [...peopleMap.values()];

  const actors = actorsData?.items ?? [];
  const actorsTotalPages = actorsData?.pagination?.totalPages ?? 1;

  const goToPage = (newPage: number) => {
    navigate({
      to: "/search",
      search: { ...params, page: newPage },
    });
  };

  const handleFilters = (values: FilterValues) => {
    navigate({
      to: "/search",
      search: {
        ...params,
        year: values.year,
        minRating: values.minRating,
        categories: values.categories,
        page: 1,
      },
    });
  };

  const contentSkeletons = (
    <>
      {[...Array(3)].map((_, i) => (
        <ContentCardSkeleton key={i} variant="result" />
      ))}
    </>
  );

  const actorSkeletons = (
    <>
      {[...Array(4)].map((_, i) => (
        <PersonCardSkeleton key={i} />
      ))}
    </>
  );

  return (
    <div className="flex flex-col gap-5 max-w-4xl pt-2 pl-2 w-full h-fit">
      <SearchBar
        defaultValue={title}
        preservedParams={{ year, minRating, categories }}
      />

      {title && (
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          "{title}"
        </h1>
      )}

      <SearchFilters
        values={{ year, minRating, categories }}
        onApply={handleFilters}
      />

      <Tabs defaultValue="top" onValueChange={setActiveTab}>
        <TabsList variant="none" className="flex-wrap h-auto gap-y-2">
          <TabsTrigger value="top">Top</TabsTrigger>
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="tvshows">Series</TabsTrigger>
          {title && <TabsTrigger value="actors">Actors</TabsTrigger>}
        </TabsList>
        <TabsContent value="top">
          {isLoading ? (
            contentSkeletons
          ) : (
            <>
              {contents.map((content, i) => (
                <div key={content.id}>
                  <ContentCard variant="result" content={content} />
                  {(i < contents.length - 1 || topPeople.length > 0) && (
                    <Separator />
                  )}
                </div>
              ))}
              {topPeople.map(({ person, relatedContents }, i) => (
                <div key={person.id}>
                  <PersonCard
                    person={person}
                    relatedContents={relatedContents}
                  />
                  {i < topPeople.length - 1 && <Separator />}
                </div>
              ))}
              {contents.length === 0 && topPeople.length === 0 && (
                <EmptyState
                  message={
                    title
                      ? `No results for "${title}"`
                      : "Start searching to see results"
                  }
                />
              )}
            </>
          )}
          {!isLoading && totalPages > 1 && (
            <SearchPagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </TabsContent>
        <TabsContent value="movies">
          {isLoading ? (
            contentSkeletons
          ) : movies.length > 0 ? (
            movies.map((content, i) => (
              <div key={content.id}>
                <ContentCard variant="result" content={content} />
                {i < movies.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <EmptyState
              message={
                title
                  ? `No movies for "${title}"`
                  : "Start searching to see movies"
              }
            />
          )}
          {!isLoading && totalPages > 1 && (
            <SearchPagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </TabsContent>
        <TabsContent value="tvshows">
          {isLoading ? (
            contentSkeletons
          ) : tvShows.length > 0 ? (
            tvShows.map((content, i) => (
              <div key={content.id}>
                <ContentCard variant="result" content={content} />
                {i < tvShows.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <EmptyState
              message={
                title
                  ? `No TV shows for "${title}"`
                  : "Start searching to see TV shows"
              }
            />
          )}
          {!isLoading && totalPages > 1 && (
            <SearchPagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </TabsContent>
        <TabsContent value="actors">
          {title ? (
            isActorsLoading ? (
              actorSkeletons
            ) : actors.length > 0 ? (
              <>
                {actors.map((person, i) => (
                  <div key={person.id}>
                    <PersonCard person={person} />
                    {i < actors.length - 1 && <Separator />}
                  </div>
                ))}
                {actorsTotalPages > 1 && (
                  <SearchPagination
                    page={page}
                    totalPages={actorsTotalPages}
                    onPageChange={goToPage}
                  />
                )}
              </>
            ) : (
              <EmptyState message={`No actors found for "${title}"`} />
            )
          ) : (
            <EmptyState message="Enter a search term to find actors" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-muted-foreground py-10 text-center text-sm">{message}</p>
  );
}

function SearchPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <Pagination className="py-4">
      <PaginationContent className="flex-wrap gap-y-2">
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          />
        </PaginationItem>

        {pageNumbers.map((entry, i) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`} className="hidden sm:block">
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry} className="hidden sm:block">
              <PaginationLink
                isActive={entry === page}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem className="sm:hidden">
          <span className="px-3 py-1 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) {
    pages.push("ellipsis");
  }
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) {
    pages.push("ellipsis");
  }
  pages.push(total);
  return pages;
}
