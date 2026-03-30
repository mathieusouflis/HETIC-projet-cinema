import { zodResolver } from "@hookform/resolvers/zod";
import type {
  GETContents200DataItemsItem,
  PUTWatchlistContentIdBody,
} from "@packages/api-sdk";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { DatePickerInput } from "@/components/common/date-picker-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseApiError } from "@/lib/api/parse-error";
import { useApi } from "@/lib/api/services";
import { StarPicker } from "../rating";

export const WATCHLIST_FORM_ID = "watchlist-form";

const STATUS_OPTIONS = [
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "not_interested", label: "Not Interested" },
  { value: "undecided", label: "Undecided" },
] as const;

const formSchema = z.object({
  status: z.enum([
    "plan_to_watch",
    "watching",
    "completed",
    "dropped",
    "not_interested",
    "undecided",
  ]),
  currentSeason: z.number().min(1).optional(),
  currentEpisode: z.number().min(1).optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormWatchlist(props: {
  content: GETContents200DataItemsItem;
  onSubmit?: () => void;
}) {
  const services = useApi();
  const isSeries = props.content.type === "serie";

  const { data: watchlistData, isLoading } = services.watchlist.getId(
    props.content.id
  );
  const { data: contentDetails } = services.contents.get(
    props.content.id,
    isSeries
      ? {
          withSeasons: "true",
          withEpisodes: "true",
        }
      : undefined
  );
  const { mutateAsync: updateWatchlist } = services.watchlist.updateContentId();

  type SeasonOption = {
    id: string;
    seasonNumber: number;
    episodeCount: number | null;
    episodes?: Array<{
      episodeNumber: number;
    }>;
  };

  const availableSeasons = useMemo(() => {
    if (!isSeries) {
      return [];
    }

    const seasons = (contentDetails?.seasons ??
      props.content.seasons ??
      []) as SeasonOption[];

    return [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
  }, [contentDetails?.seasons, isSeries, props.content.seasons]);

  const initialValues = useMemo(() => {
    if (watchlistData?.data?.data) {
      const d = watchlistData.data.data;
      return {
        status: d.status,
        currentSeason: d.currentSeason ?? undefined,
        currentEpisode: d.currentEpisode ?? undefined,
        startedAt: d.startedAt ? new Date(d.startedAt) : undefined,
        completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
        rating: (d as { rating?: number | null }).rating ?? null,
      };
    }
    return {
      status: "plan_to_watch" as const,
      currentSeason: undefined,
      currentEpisode: undefined,
      startedAt: undefined,
      completedAt: undefined,
      rating: null,
    };
  }, [watchlistData?.data?.data]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const selectedSeasonNumber = form.watch("currentSeason");
  const selectedSeason = useMemo(
    () =>
      availableSeasons.find(
        (season) => season.seasonNumber === selectedSeasonNumber
      ),
    [availableSeasons, selectedSeasonNumber]
  );

  const availableEpisodes = useMemo(() => {
    if (!selectedSeason) {
      return [];
    }

    if (selectedSeason.episodes?.length) {
      return [...selectedSeason.episodes].sort(
        (a, b) => a.episodeNumber - b.episodeNumber
      );
    }

    const episodeCount = selectedSeason.episodeCount ?? 0;

    return Array.from({ length: episodeCount }, (_, index) => ({
      episodeNumber: index + 1,
    }));
  }, [selectedSeason]);

  // Reset form when watchlist data loads - use primitive dependencies to avoid stale closures
  const watchlistDataId = watchlistData?.data?.data?.id;
  useEffect(() => {
    if (watchlistDataId) {
      form.reset(initialValues, { keepDefaultValues: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlistDataId]);

  useEffect(() => {
    if (!isSeries) {
      return;
    }

    const currentEpisode = form.getValues("currentEpisode");

    if (!selectedSeason) {
      if (currentEpisode !== undefined) {
        form.setValue("currentEpisode", undefined, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      return;
    }

    const availableEpisodeNumbers = new Set(
      availableEpisodes.map((episode) => episode.episodeNumber)
    );

    if (
      currentEpisode !== undefined &&
      !availableEpisodeNumbers.has(currentEpisode)
    ) {
      form.setValue("currentEpisode", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [availableEpisodes, form, isSeries, selectedSeason]);

  const onSubmit = async (values: FormValues) => {
    try {
      await updateWatchlist({
        id: props.content.id,
        data: values as unknown as PUTWatchlistContentIdBody,
      });
      props.onSubmit?.();
    } catch (err) {
      const { globalError } = parseApiError(err);
      if (globalError) {
        form.setError("root", { message: globalError });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <form id={WATCHLIST_FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Status</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent className="z-[52]">
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {isSeries && (
          <>
            <Controller
              name="currentSeason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Current Season</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => {
                      const nextSeason = Number(value);
                      field.onChange(nextSeason);
                      form.setValue("currentEpisode", undefined, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select a season" />
                    </SelectTrigger>
                    <SelectContent className="z-[52]">
                      {availableSeasons.map((season) => (
                        <SelectItem
                          key={season.id}
                          value={String(season.seasonNumber)}
                        >
                          {`Season ${season.seasonNumber}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="currentEpisode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Current Episode</FieldLabel>
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={!selectedSeason || availableEpisodes.length === 0}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Select an episode" />
                    </SelectTrigger>
                    <SelectContent className="z-[52]">
                      {availableEpisodes.map((episode) => (
                        <SelectItem
                          key={episode.episodeNumber}
                          value={String(episode.episodeNumber)}
                        >
                          {`Episode ${episode.episodeNumber}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </>
        )}
        <Controller
          name="startedAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Started At</FieldLabel>
              <DatePickerInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a start date"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="completedAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Completed At</FieldLabel>
              <DatePickerInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Pick a completion date"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="rating"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Rating</FieldLabel>
              <StarPicker
                value={field.value ?? null}
                onChange={field.onChange}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      {form.formState.errors.root && (
        <p className="text-destructive mt-2 text-sm">
          {form.formState.errors.root.message}
        </p>
      )}
    </form>
  );
}
