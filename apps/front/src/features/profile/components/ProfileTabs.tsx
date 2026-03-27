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
      <div className="flex justify-between border-b border-neutral-200">
        {["dashboard", "comments", "watchpartys", "lists"].map((tab) => (
          <button
            type="button"
            key={tab}
            disabled={DISABLED_TABS.includes(tab as Tab)}
            onClick={() => setActiveTab(tab as Tab)}
            className={cn(profileTabClassName, {
              "border-b-primary text-foreground font-medium": activeTab === tab,
              "border-b-transparent text-muted-foreground": activeTab !== tab,
            })}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && <DashboardTab stats={stats} />}
      {activeTab === "comments" && <CommentsTab />}
      {activeTab === "watchpartys" && <WatchpartysTab />}
      {activeTab === "lists" && <ListsTab />}
    </div>
  );
}
