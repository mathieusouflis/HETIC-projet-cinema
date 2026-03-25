import { Link, redirect, useParams } from "@tanstack/react-router";
import { Pen, Plus } from "lucide-react";
import {
  ContentCard,
  ContentCardSkeleton,
} from "@/components/common/content-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useApi } from "@/lib/api/services";
import AddContentToWatchlistDialog from "../watchlist/components/dialog";

export function ContentPage() {
  const { contentId } = useParams({
    from: "/_main/contents/$contentId/",
  });
  const api = useApi();

  const { data: watchlistData } = api.watchlist.getId(contentId);

  const { data, isLoading } = api.contents.get(contentId, {
    withCast: "true",
    withCategory: "true",
    withEpisodes: "true",
    withPlatform: "true",
    withSeasons: "true",
  });

  if (!data && !isLoading) {
    redirect({
      to: "..",
    });
  }

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-14 items-center md:items-start md:flex-row">
        <div className="flex flex-col gap-3 max-w-full items-center md:items-baseline w-fit md:w-80">
          {isLoading || !data ? (
            <ContentCardSkeleton
              variant="thumbnail"
              className="w-full h-fit sm:w-fit"
            />
          ) : (
            <ContentCard
              variant="thumbnail"
              content={data}
              className="h-[70vh] max-w-full"
            />
          )}
          <div className="flex flex-row gap-3 w-full md:w-auto">
            <Link
              target="_blank"
              to={data?.trailerUrl ?? undefined}
              className="w-full"
            >
              <Button
                variant={"default"}
                color="blue"
                size={"xl"}
                disabled={!data?.trailerUrl}
                className="w-full dark:text-white"
              >
                Watch Trailer
              </Button>
            </Link>
            {data && (
              <AddContentToWatchlistDialog
                variant={watchlistData?.data.data ? "edit" : "new"}
                content={data}
              >
                <Button variant={"default"} color="blue" size={"icon-xl"}>
                  {watchlistData?.data.data ? (
                    <Pen className="dark:bg-white" />
                  ) : (
                    <Plus className="dark:stroke-white" />
                  )}
                </Button>
              </AddContentToWatchlistDialog>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex-flex-col gap-2">
            <h1 className="text-3xl font-bold">{data?.title}</h1>
            <div className="flex flex-row gap-2 text-muted-foreground">
              <span>
                {data?.releaseDate
                  ? (() => {
                      const d = new Date(data.releaseDate);
                      const day = d.getDate();
                      const month = d
                        .toLocaleString("default", { month: "long" })
                        .toLowerCase();
                      const year = d.getFullYear();
                      return `${day} ${month} ${year}`;
                    })()
                  : null}
              </span>
              |<span>{data?.durationMinutes} minutes</span>
            </div>
          </div>
          <p className="md:max-w-1/2">{data?.synopsis}</p>
        </div>
      </div>
      {data?.type === "serie" && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Seasons</h2>
          <Accordion type="multiple">
            {data.seasons?.map((season) => {
              return (
                <AccordionItem key={season.id} value={season.id.toString()}>
                  <AccordionTrigger>{season.name}</AccordionTrigger>
                  <AccordionContent className="flex flex-col">
                    {season.episodes?.map((ep) => (
                      <span
                        key={ep.id}
                        className="w-full p-2 hover:bg-muted rounded-lg duration-200"
                      >
                        {ep.name}
                      </span>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      {data?.contentCredits && data?.contentCredits.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Credits</h2>
          <ScrollArea>
            <div className="flex flex-row w-full">
              {data.contentCredits.map((cc) => (
                <ContentCredit
                  key={cc.id}
                  avatarUrl={cc.photoUrl}
                  name={cc.name}
                />
              ))}
              <ScrollBar orientation="horizontal" />
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function ContentCredit(props: { avatarUrl: string | null; name: string }) {
  return (
    <div className="flex flex-col gap-1 h-40">
      {props.avatarUrl ? (
        <img
          src={props.avatarUrl}
          alt={`${props.name} avatar`}
          className="aspect-square h-full w-fit object-cover rounded-2xl"
        />
      ) : (
        <span className="aspect-square h-full w-fit rounded-2xl bg-muted" />
      )}
      {props.name}
    </div>
  );
}
