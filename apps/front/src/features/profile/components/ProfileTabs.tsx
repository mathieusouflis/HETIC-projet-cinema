import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProfileStats } from "../domain/ProfileStats";
import { CommentsTab } from "./CommentsTab";
import { DashboardTab } from "./DashboardTab";
import { ListsTab } from "./ListsTab";
import { WatchpartysTab } from "./WatchpartysTab";

type Props = {
  stats: ProfileStats;
};

type Tab = "dashboard" | "comments" | "watchpartys" | "lists";

const DISABLED_TABS: Tab[] = ["comments", "watchpartys", "lists"];

export function ProfileTabs({ stats }: Props) {
  return (
    <Tabs defaultValue="dashboard" className="flex flex-col gap-4">
      <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsList
          variant="profile"
          className="inline-flex min-w-max sm:min-w-0"
        >
          {["dashboard", "comments", "watchpartys", "lists"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              disabled={DISABLED_TABS.includes(tab as Tab)}
              className="whitespace-nowrap"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="dashboard">
        <DashboardTab stats={stats} />
      </TabsContent>
      <TabsContent value="comments">
        <CommentsTab />
      </TabsContent>
      <TabsContent value="watchpartys">
        <WatchpartysTab />
      </TabsContent>
      <TabsContent value="lists">
        <ListsTab />
      </TabsContent>
    </Tabs>
  );
}
