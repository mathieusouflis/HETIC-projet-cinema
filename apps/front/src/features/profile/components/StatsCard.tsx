import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProfileStats } from "../domain/ProfileStats";
import {
  profileInsetPanelClassName,
  profileMetricCardClassName,
} from "./profile.styles";

type Props = {
  stats: ProfileStats;
};

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <StatsShowcaseCard
        title="Series"
        headline={`${stats.totalSeriesHours}h watched`}
        detail={`${stats.totalEpisodes} episodes tracked`}
        accentClassName="border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-sky-100/70 dark:border-sky-400/20 dark:from-sky-500/12 dark:via-white/4 dark:to-transparent"
      />
      <StatsShowcaseCard
        title="Movies"
        headline={`${stats.totalMovieHours}h watched`}
        detail={`${stats.totalMovies} movies completed`}
        accentClassName="border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-amber-100/70 dark:border-amber-400/20 dark:from-amber-500/12 dark:via-white/4 dark:to-transparent"
      />
    </div>
  );
}

function StatsShowcaseCard({
  title,
  headline,
  detail,
  accentClassName,
}: {
  title: string;
  headline: string;
  detail: string;
  accentClassName: string;
}) {
  return (
    <Card className={cn(profileMetricCardClassName, accentClassName)}>
      <CardContent className="flex h-full flex-col gap-6 p-6">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight">
              {headline}
            </h3>
          </div>
        </div>

        <div
          className={cn(
            "mt-auto px-4 py-3 text-sm text-muted-foreground",
            profileInsetPanelClassName
          )}
        >
          {detail}
        </div>
      </CardContent>
    </Card>
  );
}
