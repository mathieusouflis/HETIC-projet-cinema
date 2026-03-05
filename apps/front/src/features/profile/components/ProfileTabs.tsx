import { useState } from "react";
import type { ProfileStats } from "../domain/ProfileStats";
import { CommentsTab } from "./CommentsTab";
import { DashboardTab } from "./DashboardTab";
import { ListsTab } from "./ListsTab";
import { WatchpartysTab } from "./WatchpartysTab";

type Props = {
  stats: ProfileStats;
};

type Tab = "dashboard" | "comments" | "watchpartys" | "lists";

export function ProfileTabs({ stats }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between border-b">
        {["dashboard", "comments", "watchpartys", "lists"].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`pb-2 text-sm capitalize ${
              activeTab === tab
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground"
            }`}
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
