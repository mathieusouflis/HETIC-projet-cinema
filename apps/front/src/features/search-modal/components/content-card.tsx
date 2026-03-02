import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  id: string;
  title: string;
  year: number | null;
  category?: string;
  country?: string;
  posterUrl: string | null;
  className?: string;
}

export const ContentCard = ({
  id,
  title,
  year,
  category,
  country,
  posterUrl,
  className,
  ...props
}: ContentCardProps & ComponentProps<"a">) => {
  const routes = useRoutes();
  return (
    <Link
      to={routes.contents.detail(id)}
      className={cn("grid grid-cols-2 gap-2.5", className)}
      {...props}
    >
      {posterUrl ? (
        <img src={posterUrl} alt={title} className="w-full h-auto rounded-md" />
      ) : (
        <span className="bg-muted-foreground w-full h-full rounded-md" />
      )}
      <div className="flex flex-col gap-3 w-full">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p>
          {year ? year : "Unknown"} - {category || "Unknown"} -{" "}
          {country || "Unknown"}
        </p>
      </div>
    </Link>
  );
};

export const ContentCardSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-2.5 col-span-2">
      <Skeleton className="w-full h-auto aspect-3/4 rounded-md" />
      <div className="flex flex-col gap-3 w-full">
        <Skeleton className="w-full h-8 rounded-md" />
        <Skeleton className="w-full h-4 rounded-md" />
      </div>
    </div>
  );
};
