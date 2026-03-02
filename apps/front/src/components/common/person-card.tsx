import type { GETContents200DataItemsItem } from "@packages/api-sdk";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { baseRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Minimal shape accepted by both content-credits and people-search responses. */
export interface PersonData {
  id: string;
  name: string;
  photoUrl: string | null;
  nationality: string | null;
  contentCredits?: { role: string }[];
}

interface PersonCardProps {
  person: PersonData;
  relatedContents?: GETContents200DataItemsItem[];
  className?: string;
}

export const PersonCard = ({
  person,
  relatedContents = [],
  className,
}: PersonCardProps) => {
  const role = person.contentCredits?.[0]?.role ?? "Actor";

  return (
    <div className={cn("flex items-start gap-4 py-5", className)}>
      <div className="shrink-0">
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.name}
            className="w-28 lg:w-36 h-40 lg:h-52 object-cover rounded-2xl"
          />
        ) : (
          <span className="block w-28 lg:w-36 h-40 lg:h-52 bg-muted rounded-2xl" />
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <h3 className="text-lg font-bold">{person.name}</h3>

        <p className="text-sm text-muted-foreground">
          {[person.nationality, role].filter(Boolean).join(" - ")}
        </p>

        {relatedContents.length > 0 && (
          <div className="hidden lg:flex flex-col gap-1 mt-2">
            <p className="text-xs font-medium text-muted-foreground">
              Related Movies
            </p>
            <div className="flex gap-3 flex-wrap">
              {relatedContents.slice(0, 3).map((content) => (
                <Link
                  key={content.id}
                  to={baseRoutes.contents.detail(content.id)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {content.posterUrl ? (
                    <img
                      src={content.posterUrl}
                      alt={content.title}
                      className="size-6 rounded object-cover shrink-0"
                    />
                  ) : (
                    <span className="size-6 rounded bg-muted block shrink-0" />
                  )}
                  {content.title} ↘
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 self-center ml-2 flex items-center gap-2">
        <Button variant="ghost" size="icon-2xl" className="rounded-full">
          <Heart className="size-5" />
        </Button>
        <span className="hidden lg:block text-sm text-muted-foreground">
          13 000
        </span>
      </div>
    </div>
  );
};

export const PersonCardSkeleton = () => (
  <div className="flex items-start gap-4 py-5">
    <Skeleton className="w-28 lg:w-36 h-40 lg:h-52 rounded-2xl shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  </div>
);
