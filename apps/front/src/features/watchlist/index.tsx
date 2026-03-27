import type { GETWatchlist200DataItemsItem } from "@packages/api-sdk";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/lib/api/services";
import { EmptyState } from "./components/empty-state";
import { TableHeader } from "./components/header";
import { WatchlistRowSkeleton } from "./components/row";
import { WatchlistSection } from "./components/section";
import { STATUS_LABELS, STATUS_ORDER, STATUS_TABS } from "./constants";

function AllTabContent({ items }: { items: GETWatchlist200DataItemsItem[] }) {
  const nonEmpty = STATUS_ORDER.filter((s) =>
    items.some((i) => i.status === s)
  );

  if (nonEmpty.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {nonEmpty.map((status, idx) => {
        const section = items.filter((i) => i.status === status);
        return (
          <div key={status}>
            {idx > 0 && <Separator className="mb-6" />}
            <h2 className="mb-3 text-base font-semibold">
              {STATUS_LABELS[status]}
            </h2>
            <WatchlistSection items={section} />
          </div>
        );
      })}
    </div>
  );
}

export default function WatchlistPage() {
  const api = useApi();
  const { data, isLoading } = api.watchlist.list();

  const items: GETWatchlist200DataItemsItem[] = data?.data.data.items ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <Tabs defaultValue="all">
        {/* tab pills */}
        <TabsList
          variant="premium"
          className="mb-6 flex h-auto w-full flex-wrap gap-2 justify-start"
        >
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="grow-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TableHeader />

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <WatchlistRowSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AllTabContent items={items} />
          )}
        </TabsContent>

        {STATUS_TABS.filter((t) => t.value !== "all").map((tab) => {
          const filtered = items.filter((i) => i.status === tab.value);
          return (
            <TabsContent key={tab.value} value={tab.value}>
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <WatchlistRowSkeleton key={i + 1} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <WatchlistSection items={filtered} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
