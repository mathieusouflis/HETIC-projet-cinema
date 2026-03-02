import type { ProfileStats } from "../domain/ProfileStats";
import { CalendarSection } from "./CalendarSection";
import { StatsCards } from "./StatsCard";
import { UpcomingSection } from "./UpcomingSection";
import { WatchpartySection } from "./WatchpartySection";

type Props = {
  stats: ProfileStats;
};

export function DashboardTab({ stats }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <StatsCards stats={stats} />
      <CalendarSection />
      <UpcomingSection />
      <WatchpartySection />
    </div>
  );
}
