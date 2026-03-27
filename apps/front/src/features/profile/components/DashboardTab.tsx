import type { ProfileStats } from "../domain/ProfileStats";
import { CompletedContentSection } from "./CompletedContentSection";
import { StatsCards } from "./StatsCard";

type Props = {
  stats: ProfileStats;
};

export function DashboardTab({ stats }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <StatsCards stats={stats} />
      <CompletedContentSection />
    </div>
  );
}
