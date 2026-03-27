import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProfileStats } from "../domain/ProfileStats";
import { CommentsTab } from "./CommentsTab";
import { DashboardTab } from "./DashboardTab";
import { ListsTab } from "./ListsTab";
import { profileTabClassName } from "./profile.styles";
import { WatchpartysTab } from "./WatchpartysTab";

type Props = {
  stats: ProfileStats;
};

type Tab = "dashboard" | "comments" | "watchpartys" | "lists";

const DISABLED_TABS: Tab[] = ["comments", "watchpartys", "lists"];

export function ProfileTabs({ stats }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="surface-inset inline-flex min-w-full gap-2 rounded-[28px] p-2 sm:flex sm:min-w-0 sm:flex-wrap">
          {["dashboard", "comments", "watchpartys", "lists"].map((tab) => (
            <button
              type="button"
              key={tab}
              disabled={DISABLED_TABS.includes(tab as Tab)}
              onClick={() => setActiveTab(tab as Tab)}
              className={cn(profileTabClassName, "shrink-0 whitespace-nowrap", {
                "bg-foreground text-background shadow-sm dark:bg-white dark:text-neutral-950":
                  activeTab === tab,
                "text-muted-foreground hover:bg-background/70 hover:text-foreground dark:hover:bg-white/8":
                  activeTab !== tab,
              })}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "dashboard" && <DashboardTab stats={stats} />}
      {activeTab === "comments" && <CommentsTab />}
      {activeTab === "watchpartys" && <WatchpartysTab />}
      {activeTab === "lists" && <ListsTab />}
    </div>
  );
}
